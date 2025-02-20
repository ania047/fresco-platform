import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded?.user?.id;
  } catch (error) {
    console.error("Token invalid:", error);
    return null;
  }
}

function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!token || !userId) {
      setError("Nu ești autentificat!");
      setLoading(false);
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/cart/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCartItems(response.data);
      } catch (err) {
        console.error("Eroare la obținerea coșului:", err);
        setError("Eroare la încărcarea coșului.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [token, userId]);

  const removeFromCart = async (productId) => {
    if (!token || !userId) {
      setError("Nu ești autentificat!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/cart/${userId}/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCartItems((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );
    } catch (err) {
      console.error("Eroare la ștergerea produsului din coș:", err);
      setError("Nu am putut șterge produsul din coș.");
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (!token || !userId) {
      setError("Nu ești autentificat!");
      return;
    }
    if (newQty < 1) {
      setError("Cantitatea minimă este 1.");
      return;
    }

    try {
      await axios.patch(
        `http://localhost:5000/api/cart/${userId}/${productId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      console.error("Eroare la actualizarea cantității:", err);
      setError("Nu am putut actualiza cantitatea.");
    }
  };

  return {
    cartItems,
    loading,
    error,
    setError,
    removeFromCart,
    updateQuantity,
  };
}

function getDiscountedPrice(item) {
  const originalPrice = parseFloat(item.price) || 0;
  const dbDiscount = parseFloat(item.discount) || 0;
  const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;

  let finalDiscount = 0;
  if (expiryDate) {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 0 && diffDays <= 5) {
      finalDiscount = dbDiscount;
    }
  }
  return originalPrice * ((100 - finalDiscount) / 100);
}

const CartModal = ({ closeModal }) => {
  const navigate = useNavigate();

  const {
    cartItems,
    loading,
    error,
    setError,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const totalPrice = cartItems.reduce((acc, item) => {
    const discountedPrice = getDiscountedPrice(item);
    return acc + discountedPrice * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError("Coșul este gol! Adaugă produse înainte de a finaliza comanda.");
      return;
    }
    navigate("/checkout");
  };

  const handleQuantityChange = (productId, newValue) => {
    const parsed = parseInt(newValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateQuantity(productId, parsed);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[500px] p-6 flex flex-col h-[80%] max-h-[600px] rounded-lg shadow-lg relative">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Coș de cumpărături</h3>
          <button
            onClick={closeModal}
            aria-label="Închide coșul de cumpărături"
            className="text-2xl cursor-pointer"
          >
            <IoCloseOutline />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 my-2 rounded">
            {error}
          </div>
        )}

        <ul className="flex-grow overflow-y-auto mt-4 space-y-3">
          {loading ? (
            <p>Se încarcă...</p>
          ) : cartItems.length === 0 ? (
            <p>Coșul este gol.</p>
          ) : (
            cartItems.map((item) => {
              const originalPrice = parseFloat(item.price) || 0;
              const discountedPrice = getDiscountedPrice(item);
              const linePrice = discountedPrice * item.quantity;
              const isDiscounted = discountedPrice < originalPrice;

              return (
                <li
                  key={item.product_id}
                  className="flex items-center py-3 border-b space-x-4"
                >
                  <img
                    src={item.image_url || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  <div className="flex-grow min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-x-3 w-[180px]">
                    <input
                      type="number"
                      min="1"
                      className="w-14 text-center border rounded"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.product_id, e.target.value)
                      }
                    />

                    <div className="w-24 text-right">
                      {isDiscounted ? (
                        <div className="flex flex-col text-right">
                          <div className="text-xs line-through text-gray-500">
                            {(originalPrice * item.quantity).toFixed(2)} RON
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {linePrice.toFixed(2)} RON
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-gray-700">
                          {linePrice.toFixed(2)} RON
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="w-8 text-red-500 cursor-pointer text-xl"
                      title="Șterge produsul"
                    >
                      <IoTrashOutline />
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <p className="text-sm">Total:</p>
          <span className="text-lg font-semibold">
            {totalPrice.toFixed(2)} RON
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`mt-6 py-2 rounded-lg w-full text-lg font-semibold ${
            loading ? "bg-gray-400 text-gray-200" : "bg-green-600 text-white"
          }`}
        >
          {loading ? "Se încarcă..." : "Finalizează comanda"}
        </button>
      </div>
    </div>
  );
};

export default CartModal;
