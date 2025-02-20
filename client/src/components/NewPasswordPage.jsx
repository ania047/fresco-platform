import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function NewPasswordPage() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        newPassword,
      });
      setMessage("Parola a fost resetată cu succes!");
      setIsError(false);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "A apărut o eroare!");
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full p-8">
        <h1 className="text-2xl text-center font-bold text-gray-800">
          Resetează parola
        </h1>
        <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Noua Parolă
            </label>
            <input
              id="newPassword"
              type="password"
              required
              placeholder="Introdu noua parolă"
              className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-green-700 text-white rounded shadow hover:bg-green-800 transition font-semibold"
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
      </div>
    </div>
  );
}

export default NewPasswordPage;
