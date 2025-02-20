import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      console.log("Răspuns de la server:", response.data);

      if (
        !response.data.user ||
        !response.data.user.firstname ||
        !response.data.user.lastname
      ) {
        console.error("Eroare: API-ul nu returnează firstname și lastname.");
        setMessage("Eroare la autentificare! Contactează suportul.");
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("firstname", response.data.user.firstname);
      localStorage.setItem("lastname", response.data.user.lastname);

      setMessage("Te-ai autentificat cu succes!");
      navigate("/home");

      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error("Eroare la autentificare:", error);
      setMessage(error.response?.data?.message || "A apărut o eroare!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full p-8">
        <div className="mb-8 text-center">
          <img src={Logo} alt="Fresco" className="h-12 mx-auto mb-12" />
          <h1 className="text-2xl font-bold text-gray-800">Autentificare</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="ex: user@email.com"
              className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Parola <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="********"
              className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <span className="ml-2 text-gray-700">Ține-mă minte</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-green-700 text-white rounded shadow hover:bg-green-800 transition font-semibold"
          >
            Autentifică-te
          </button>
        </form>

        {message && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        <p className="mt-6 text-center">
          <a
            href="\forgot-password"
            className="text-green-600 underline hover:text-green-700"
          >
            Ai uitat parola?
          </a>
        </p>

        <p className="mt-6 text-center text-sm text-gray-700">
          Nu ai cont Fresco?{" "}
          <a
            href="register"
            className="text-green-700 font-medium hover:underline"
          >
            Creează-ți unul acum
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
