import React, { useState, useEffect } from "react";
import { FaBasketShopping, FaHeart } from "react-icons/fa6";
import axios from "axios";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded?.user?.id;
  } catch (error) {
    console.error("Token invalid:", error);
    return null;
  }
};

const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      const userId = getUserIdFromToken();
      if (!userId) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/wishlist/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setWishlist(response.data.map((item) => item.product_id));
      } catch (error) {
        console.error("Eroare la încărcarea wishlist-ului:", error);
        setErrorMessage(
          "Nu am putut încărca wishlist-ul. Încearcă mai târziu."
        );
      }
    };

    fetchWishlist();
  }, []);

  const toggleWishlist = async (productId) => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setErrorMessage("Trebuie să fii logat pentru a modifica wishlist-ul.");
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        await axios.delete(
          `http://localhost:5000/api/wishlist/${userId}/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setWishlist((prev) => prev.filter((id) => id !== productId));
      } else {
        // Adăugăm în wishlist
        await axios.post(
          "http://localhost:5000/api/wishlist",
          { userId, productId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setWishlist((prev) => [...prev, productId]);
      }
    } catch (error) {
      console.error("Eroare la modificarea wishlist-ului:", error);
      setErrorMessage("A apărut o eroare la modificarea wishlist-ului.");
    }
  };

  return { wishlist, toggleWishlist, errorMessage, setErrorMessage };
};

const getDiscountData = (product) => {
  const originalPrice = parseFloat(product.price) || 0;
  const dbDiscount = parseFloat(product.discount) || 0;

  let finalDiscount = 0;
  let expiryDate = null;

  if (product.expiry_date) {
    expiryDate = new Date(product.expiry_date);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 0 && diffDays <= 5) {
      finalDiscount = dbDiscount;
    }
  }

  const discountedPrice = originalPrice * ((100 - finalDiscount) / 100);

  return { originalPrice, finalDiscount, discountedPrice, expiryDate };
};

const formatDate = (dateObj) => {
  return dateObj.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const ProductList = ({ products, addToCart }) => {
  const { wishlist, toggleWishlist, errorMessage, setErrorMessage } =
    useWishlist();
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);

  return (
    <div>
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 mb-4">{errorMessage}</div>
      )}

      <ul className="list-none p-0">
        {products.map((product) => {
          const { originalPrice, finalDiscount, discountedPrice, expiryDate } =
            getDiscountData(product);
          const isInWishlist = wishlist.includes(product.id);

          return (
            <li
              key={product.id}
              className="border-b pb-4 mb-4 flex items-center space-x-4"
            >
              <img
                src={product.image_url || "/placeholder.jpg"}
                alt={`${product.name}`}
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex flex-col flex-grow">
                <span className="text-sm font-medium text-gray-800">
                  {product.name}
                </span>

                {finalDiscount > 0 ? (
                  <div className="mt-2">
                    <span className="text-sm line-through text-gray-500 mr-2">
                      {originalPrice.toFixed(2)} RON
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {discountedPrice.toFixed(2)} RON
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-sm font-bold text-gray-800">
                    {originalPrice.toFixed(2)} RON
                  </div>
                )}

                {expiryDate && (
                  <div className="text-xs text-gray-600 mt-1">
                    Expiră: {formatDate(expiryDate)}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`text-lg ${
                    isInWishlist ? "text-red-500" : "text-gray-400"
                  } hover:text-red-500 transition`}
                  aria-label={
                    isInWishlist
                      ? `Șterge ${product.name} din wishlist`
                      : `Adaugă ${product.name} în wishlist`
                  }
                  disabled={!userId}
                  title={!userId ? "Trebuie să fii logat pentru wishlist" : ""}
                >
                  <FaHeart />
                </button>

                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center text-lg space-x-1 text-green-600 hover:text-green-700 transition"
                  aria-label={`Adaugă ${product.name} în coș`}
                  disabled={!userId}
                  title={!userId ? "Trebuie să fii logat pentru a cumpăra" : ""}
                >
                  <FaBasketShopping />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProductList;
