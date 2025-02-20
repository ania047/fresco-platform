import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import IconProfile from "../assets/icons/icon-user.svg";
import IconMap from "../assets/icons/icon-map.svg";
import IconOrder from "../assets/icons/icon-order.svg";
import IconWishlist from "../assets/icons/icon-wishlist.svg";
import IconLogout from "../assets/icons/icon-logout.svg";
import { IoTrashOutline } from "react-icons/io5";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error("User not authenticated.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/wishlist/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setWishlist(response.data);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    const userId = getUserIdFromToken();
    try {
      await axios.delete(
        `http://localhost:5000/api/wishlist/${userId}/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setWishlist(wishlist.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
    }
  };

  const addToCart = async (product) => {
    const userId = getUserIdFromToken();
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Tokenul este necesar pentru a adăuga în coș.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/cart",
        {
          userId: userId,
          productId: product.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Produs adăugat în coș:", product);
    } catch (error) {
      console.error("Eroare la adăugarea în coș:", error);
    }
  };

  if (loading) {
    return <p className="text-center">Se încarcă lista de dorințe...</p>;
  }

  return (
    <div className="flex mt-20">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-50 p-6 min-h-screen border-r">
        <h3 className="text-lg font-bold mb-4">
          Salut, <span className="text-green-600">Ana-Maria!</span>
        </h3>
        <nav className="space-y-4">
          <button className="flex items-center text-gray-700 hover:text-gray-900">
            <img src={IconProfile} alt="Profil" className="w-5 h-5 mr-2" />{" "}
            Profil
          </button>
          <button className="flex items-center text-gray-700 hover:text-gray-900">
            <img src={IconMap} alt="Adrese" className="w-5 h-5 mr-2" /> Adrese
          </button>
          <button className="flex items-center text-gray-700 hover:text-gray-900">
            <img src={IconOrder} alt="Comenzi" className="w-5 h-5 mr-2" />{" "}
            Comenzi
          </button>
          <button className="flex items-center text-gray-700 hover:text-gray-900">
            <img src={IconWishlist} alt="Favorite" className="w-5 h-5 mr-2" />{" "}
            Favorite
          </button>
          <button className="flex items-center text-red-600 hover:text-red-800">
            <img src={IconLogout} alt="Logout" className="w-5 h-5 mr-2" />{" "}
            Deconectare
          </button>
        </nav>
      </aside>

      <main className="w-3/4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Lista de favorite{" "}
            <span className="text-gray-500 text-sm">
              ({wishlist.length} produse)
            </span>
          </h2>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
            ADAUGĂ TOT ÎN COȘ
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-lg shadow flex items-center justify-between border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={product.image_url || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {product.name}
                  </h3>

                  <button
                    className="flex items-center space-x-1 text-red-500 hover:text-red-700"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <IoTrashOutline size={14} />
                    <span className="text-sm">Șterge</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <p className="text-base font-semibold text-gray-900">
                  {product.discount
                    ? `${product.price} Lei`
                    : `${product.original_price} Lei`}
                </p>

                <button
                  className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition"
                  onClick={() => addToCart(product)}
                >
                  <FaShoppingCart size={18} />
                  <span>ADAUGĂ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;
