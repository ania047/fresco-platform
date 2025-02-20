import sys
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from flask import Flask, jsonify, request
import nltk
from nltk.corpus import stopwords
from datetime import datetime

DB_USER = "fresco_user"
DB_HOST = "localhost"
DB_NAME = "fresco_db"
DB_PASS = ""
DB_PORT = ""

connection_string = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(connection_string)


query = "SELECT * FROM user_activity;"
user_activity = pd.read_sql(query, engine)

print("Date din tabela user_activity:")
print(user_activity.head())

action_weights = {
    'view': 1,
    'click': 1.5,
    'add_to_cart': 2.5,
    'purchase': 5
}
user_activity['weight'] = user_activity['action'].map(action_weights)


def split_data(data, split_ratio=0.8):
    """
    Împarte datasetul în train și test fie pe baza coloanei 'view_time' (dacă există),
    fie aleator (dacă nu există 'view_time').
    """
    if 'view_time' in data.columns:
        data['view_time'] = pd.to_datetime(data['view_time'], errors='coerce')
        cutoff = data['view_time'].quantile(split_ratio)
        train = data[data['view_time'] <= cutoff]
        test = data[data['view_time'] > cutoff]
        print("Împărțire realizată pe baza view_time.")
    else:
        train = data.sample(frac=split_ratio, random_state=42)
        test = data.drop(train.index)
        print("Împărțire aleatorie realizată deoarece view_time nu există.")
    return train, test

train_data, test_data = split_data(user_activity, split_ratio=0.8)

train_user_product_matrix = train_data.pivot_table(
    index='user_id',
    columns='product_id',
    values='weight',
    aggfunc='sum',
    fill_value=0
)

similarity_matrix = cosine_similarity(train_user_product_matrix)
similarity_df = pd.DataFrame(
    similarity_matrix,
    index=train_user_product_matrix.index,
    columns=train_user_product_matrix.index
)

def recommend_cf(target_user_id, top_n=20):
    if target_user_id not in train_user_product_matrix.index:
        return []
    
    similar_users = similarity_df[target_user_id].drop(target_user_id).sort_values(ascending=False)
    
    target_user_products = set(train_user_product_matrix.columns[train_user_product_matrix.loc[target_user_id] > 0])
    
    recommendation_scores = {}
    for other_user, sim_score in similar_users.items():
        other_user_products = train_user_product_matrix.columns[train_user_product_matrix.loc[other_user] > 0]
        for product in other_user_products:
            if product not in target_user_products:
                recommendation_scores[product] = recommendation_scores.get(product, 0) + sim_score
    
    recommended_products = sorted(recommendation_scores.items(), key=lambda x: x[1], reverse=True)
    return recommended_products  

products_df = pd.read_sql("SELECT id, description FROM products;", engine)

nltk.download('stopwords')
romanian_stop_words = stopwords.words('romanian')

vectorizer = TfidfVectorizer(stop_words=romanian_stop_words)
tfidf_matrix = vectorizer.fit_transform(products_df['description'].fillna(''))

product_ids = products_df['id'].tolist()
product_id_to_index = {pid: idx for idx, pid in enumerate(product_ids)}

def get_product_vector(product_id):
    idx = product_id_to_index.get(product_id)
    if idx is not None:
        return tfidf_matrix[idx]
    return None

def build_user_profile(user_id):
    user_interactions = train_data[train_data['user_id'] == user_id]
    products_interacted = user_interactions['product_id'].unique()
    vectors = []
    for pid in products_interacted:
        vec = get_product_vector(pid)
        if vec is not None:
            vectors.append(vec.toarray()[0])
    if vectors:
        user_profile = np.mean(np.array(vectors), axis=0)
        return user_profile.reshape(1, -1)
    return None

def content_score(user_profile, product_id):
    prod_vec = get_product_vector(product_id)
    if prod_vec is None or user_profile is None:
        return 0.0
    sim = cosine_similarity(user_profile, prod_vec)
    return sim[0][0]

def recommend_hybrid(user_id, top_n=25, alpha=0.45):

    cf_recs = recommend_cf(user_id, top_n=top_n*2)
    
    user_profile = build_user_profile(user_id)
    
    hybrid_scores = {}
    for pid, cf_score in cf_recs:
        cb_score = content_score(user_profile, pid)
        final_score = alpha * cf_score + (1 - alpha) * cb_score
        hybrid_scores[pid] = final_score
    
    recommended = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return recommended  


def precision_at_k(recommended, relevant, k):
    recommended_k = recommended[:k]
    if k == 0:
        return 0.0
    return len(set(recommended_k) & set(relevant)) / k

def recall_at_k(recommended, relevant, k):
    recommended_k = recommended[:k]
    if len(relevant) == 0:
        return 0.0
    return len(set(recommended_k) & set(relevant)) / len(relevant)

def f1_score_custom(prec, rec):
    if prec + rec == 0:
        return 0.0
    return 2 * prec * rec / (prec + rec)

def average_precision(recommended, relevant):
    score = 0.0
    num_hits = 0.0
    for i, prod in enumerate(recommended):
        if prod in relevant:
            num_hits += 1
            score += num_hits / (i + 1)
    if not relevant:
        return 0.0
    return score / len(relevant)

def run_evaluation(K=25, alpha=0.45):
  
    test_user_products = test_data.groupby('user_id')['product_id'].apply(set).to_dict()
    
    precisions = []
    recalls = []
    f1_scores = []
    average_precisions = []
    hits = []  

    for user_id, relevant_products in test_user_products.items():

        if user_id not in train_user_product_matrix.index:
            continue

        recs = recommend_hybrid(user_id, top_n=K, alpha=alpha)
        recommended_ids = [pid for pid, score in recs]
        
        prec = precision_at_k(recommended_ids, relevant_products, K)
        rec = recall_at_k(recommended_ids, relevant_products, K)
        f1_val = f1_score_custom(prec, rec)
        ap = average_precision(recommended_ids, relevant_products)
        hit = 1 if len(set(recommended_ids) & relevant_products) > 0 else 0
        
        precisions.append(prec)
        recalls.append(rec)
        f1_scores.append(f1_val)
        average_precisions.append(ap)
        hits.append(hit)

    mean_precision = np.mean(precisions) if precisions else 0.0
    mean_recall = np.mean(recalls) if recalls else 0.0
    mean_f1 = np.mean(f1_scores) if f1_scores else 0.0
    mean_ap = np.mean(average_precisions) if average_precisions else 0.0


    print(f"Evaluare pentru K={K} și alpha={alpha}:")
    print(f" Precision@{K}: {mean_precision:.4f}")
    print(f" Recall@{K}   : {mean_recall:.4f}")
    print(f" F1-Score     : {mean_f1:.4f}")
    print(f" MAP          : {mean_ap:.4f}")
  

def get_product_details(product_ids, score_map):

    if not product_ids:
        return pd.DataFrame()

    query = f"""
    SELECT 
        id, 
        name, 
        category, 
        discount, 
        image_url,
        price AS original_price,
        (price * (100 - discount) / 100) AS price
    FROM products
    WHERE id IN ({",".join(map(str, product_ids))});
    """
    details_df = pd.read_sql(query, engine)
    details_df["score"] = details_df["id"].map(score_map)
    return details_df


app = Flask(__name__)

@app.route("/api/recommendations", methods=["GET"])
def api_recommendations():
   
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    recs = recommend_hybrid(user_id, top_n=5, alpha=0.45)

    recommended_ids = [pid for pid, score in recs]
    score_map = dict(recs)

    details_df = get_product_details(recommended_ids, score_map)
    data = details_df.to_dict(orient="records")
    return jsonify(data)

def run_app():
    print("Pornire server Flask pe portul 5001...")
    app.run(debug=True, port=5001)

if __name__ == "__main__":
    # Dacă se rulează cu 'python script.py eval', facem evaluarea
    if len(sys.argv) > 1 and sys.argv[1] == "eval":
        run_evaluation(K=25, alpha=0.45)
    else:
        # Altfel, rulăm aplicația Flask
        run_app()
