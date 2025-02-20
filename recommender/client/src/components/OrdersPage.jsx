import React, { useEffect, useState } from "react";
import axios from "axios";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId || !token) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Eroare la obținerea comenzilor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prevExpanded) =>
      prevExpanded.includes(orderId)
        ? prevExpanded.filter((id) => id !== orderId)
        : [...prevExpanded, orderId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-center text-gray-600 text-lg">
          Se încarcă comenzile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Comenzile mele
        </h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">Nu ai plasat nicio comandă.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left text-gray-700">Comanda</th>
                  <th className="px-4 py-2 text-left text-gray-700">Total</th>
                  <th className="px-4 py-2 text-left text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-gray-700">Data</th>
                  <th className="px-4 py-2 text-left text-gray-700">Detalii</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-800">
                        <strong>#{order.id}</strong>
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {order.total_price} lei
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {order.status}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {new Date(order.created_at).toLocaleDateString("ro-RO")}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition duration-200"
                        >
                          {expandedOrders.includes(order.id)
                            ? "Ascunde detalii"
                            : "Vezi detalii"}
                        </button>
                      </td>
                    </tr>
                    {expandedOrders.includes(order.id) && order.items && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="px-4 py-4">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-300">
                                  <th className="px-4 py-2 text-left text-gray-700">
                                    Produs
                                  </th>
                                  <th className="px-4 py-2 text-left text-gray-700">
                                    Cantitate
                                  </th>
                                  <th className="px-4 py-2 text-left text-gray-700">
                                    Preț unitar
                                  </th>
                                  <th className="px-4 py-2 text-left text-gray-700">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="px-4 py-2 text-gray-800">
                                      <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="h-16 w-16 object-cover mr-4 inline-block"
                                      />
                                      {item.name}
                                    </td>
                                    <td className="px-4 py-2 text-gray-800">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-2 text-gray-800">
                                      {item.price} lei
                                    </td>
                                    <td className="px-4 py-2 text-gray-800">
                                      {(item.quantity * item.price).toFixed(2)}{" "}
                                      lei
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
