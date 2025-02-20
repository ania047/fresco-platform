import React from "react";
import { useNavigate } from "react-router-dom";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center">
          <IoCheckmarkCircleOutline className="text-green-500 w-16 h-16" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          Comanda a fost plasată cu succes!
        </h2>
        <p className="mt-2 text-gray-600">
          Poți verifica starea comenzii în secțiunea "Comenzile mele".
        </p>
        <div className="mt-6 flex justify-between space-x-4">
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-md transition duration-200"
          >
            Vezi comenzile mele
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-md transition duration-200"
          >
            Continuă cumpărăturile
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
