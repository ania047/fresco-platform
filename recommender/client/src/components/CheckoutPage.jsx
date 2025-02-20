import React, { useEffect, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [courierDetails, setCourierDetails] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    county: "",
    city: "",
    address: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data);
      } catch (error) {
        console.error("Eroare la încărcarea coșului:", error?.response);
        setError("Nu s-au putut încărca produsele din coș.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userId, token]);

  const totalPrice = cartItems.reduce((acc, item) => {
    return acc + getDiscountedPrice(item) * item.quantity;
  }, 0);

  const deliveryFee = deliveryMethod === "courier" ? 14.99 : 0;
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/orders",
        {
          userId,
          deliveryMethod,
          cartItems,
          totalPrice: finalTotal,
          paymentMethod,
          deliveryDetails: deliveryMethod === "courier" ? courierDetails : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Comanda a fost finalizată:", response.data);
      navigate("/order-success");
    } catch (error) {
      console.error("Eroare la finalizarea comenzii:", error);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { userId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Eroare la actualizarea cantității:", error);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${userId}/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (error) {
      console.error("Eroare la ștergerea produsului din coș:", error);
    }
  };

  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4 mt-20">
      <h2 className="text-2xl font-bold mb-4">Detalii comandă</h2>

      {cartItems.length > 0 ? (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Produs</th>
                <th className="text-left">Preț</th>
                <th className="text-left">Cantitate</th>
                <th className="text-left">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const originalPrice = parseFloat(item.price) || 0;
                const discountedPrice = getDiscountedPrice(item);
                const linePrice = discountedPrice * item.quantity;
                const isDiscounted = discountedPrice < originalPrice;

                return (
                  <tr key={item.product_id} className="border-b">
                    <td>{item.name}</td>

                    <td>
                      {isDiscounted ? (
                        <div>
                          <div className="line-through text-gray-500">
                            {originalPrice.toFixed(2)} lei
                          </div>
                          <div className="font-semibold text-green-600">
                            {discountedPrice.toFixed(2)} lei
                          </div>
                        </div>
                      ) : (
                        <div>{originalPrice.toFixed(2)} lei</div>
                      )}
                    </td>

                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product_id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          className="w-12 text-center border rounded"
                          onChange={(e) =>
                            handleQuantityChange(
                              item.product_id,
                              parseInt(e.target.value, 10)
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product_id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>{linePrice.toFixed(2)} lei</td>

                    <td>
                      <IoTrashOutline
                        onClick={() => handleRemoveProduct(item.product_id)}
                        className="text-red-500 cursor-pointer text-lg"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 mb-4 flex justify-between items-center border-t pt-4">
            <p className="text-lg font-semibold">Total</p>
            <span className="text-lg font-semibold">
              {finalTotal.toFixed(2)} lei
            </span>
          </div>

          <div className="bg-white rounded-lg shadow-md mb-6 p-4">
            <h3 className="text-lg font-semibold mb-2">Metoda de livrare</h3>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
              />
              <span>Ridicare personală (0 lei)</span>
            </label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="radio"
                name="deliveryMethod"
                value="courier"
                checked={deliveryMethod === "courier"}
                onChange={() => {
                  setDeliveryMethod("courier");
                  setIsModalOpen(true);
                }}
              />
              <span>Livrare prin curier (14.99 lei)</span>
            </label>
          </div>

 
          <div className="bg-white rounded-lg shadow-md mb-4 p-4">
            <h3 className="text-lg font-semibold mb-2">Metoda de plată</h3>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              <span>Plata la livrare</span>
            </label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              <span>Online cu card bancar</span>
            </label>
          </div>

          <button
            onClick={handleCheckout}
            className="mt-6 py-2 bg-green-600 text-white rounded-lg w-full text-lg font-semibold"
          >
            Plasează comanda
          </button>
        </div>
      ) : (
        <div>Coșul este gol.</div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Detalii livrare</h3>
            <input
              type="text"
              placeholder="Prenume"
              value={courierDetails.firstName}
              onChange={(e) =>
                setCourierDetails({ ...courierDetails, firstName: e.target.value })
              }
              className="w-full border p-2 my-2 rounded"
            />
            <input
              type="text"
              placeholder="Nume"
              value={courierDetails.lastName}
              onChange={(e) =>
                setCourierDetails({ ...courierDetails, lastName: e.target.value })
              }
              className="w-full border p-2 my-2 rounded"
            />
            <input
              type="text"
              placeholder="Telefon"
              value={courierDetails.phone}
              onChange={(e) =>
                setCourierDetails({ ...courierDetails, phone: e.target.value })
              }
              className="w-full border p-2 my-2 rounded"
            />
            <input
              type="text"
              placeholder="Județ"
              value={courierDetails.county}
              onChange={(e) =>
                setCourierDetails({ ...courierDetails, county: e.target.value })
              }
              className="w-full border p-2 my-2 rounded"
            />
            <input
              type="text"
              placeholder="Oraș"
              value={courierDetails.city}
              onChange={(e) =>
                setCourierDetails({ ...courierDetails, city: e.target.value })
              }
              className="w-full border p-2 my-2 rounded"
            />
            <input
              type="text"
              placeholder="Adresă"
              value={courierDetails.address}
              onChange={(e) =>
                setCourierDetails({ ...courierDetails, address: e.target.value })
              }
              className="w-full border p-2 my-2 rounded"
            />

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 bg-gray-400 text-white rounded-lg flex-1"
              >
                Renunță
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 bg-green-600 text-white rounded-lg flex-1"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
