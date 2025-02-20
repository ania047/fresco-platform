import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/forgot", {
        email,
      });
      setMessage("Mail de resetare trimis cu succes! Verifică inbox-ul.");
      setIsError(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "A apărut o eroare!");
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full p-8">
        <img src={Logo} alt="Fresco" className="h-12 mx-auto mb-12" />
        <h1 className="text-2xl mx-auto text-center font-bold text-gray-800">
          Resetează parola
        </h1>
        <form onSubmit={handleResetPassword} className="mt-10 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="ex: user@example.com"
              className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-green-700 text-white rounded shadow 
                         hover:bg-green-800 transition font-semibold"
          >
            Resetează parola
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-2 rounded ${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <button
          onClick={() => navigate("/login")}
          className="mt-6 text-green-700 font-medium hover:underline inline-flex items-center"
        >
          <span className="mr-1">←</span>
          Autentifică-te
        </button>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
