import db from "../config/db.js";

export const getCartByUserId = async (userId) => {
  try {
    const query = `
      SELECT 
        p.id AS product_id,
        p.name, 
        c.quantity, 
        p.price,
        p.expiry_date,
        p.discount,
        p.image_url
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    const query =
      "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *";
    const { rows } = await db.query(query, [userId, productId, quantity]);
    return rows[0];
  } catch (error) {
    console.error("Error adding product to cart:", error);
    throw error;
  }
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  try {
    const query =
      "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *";
    const { rows } = await db.query(query, [quantity, userId, productId]);
    return rows[0];
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    throw error;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const query =
      "DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *";
    const { rows } = await db.query(query, [userId, productId]);
    return rows[0];
  } catch (error) {
    console.error("Error removing product from cart:", error);
    throw error;
  }
};

export const getCartItem = async (userId, productId) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
    return rows[0];
  } catch (error) {
    console.error("Eroare la verificarea produsului în coș:", error);
    throw error;
  }
};
