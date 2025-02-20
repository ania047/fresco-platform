import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/logo.png";

function RegisterPage() {
  const [prenume, setPrenume] = useState("");
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [confirmaParola, setConfirmaParola] = useState("");
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          setLocation({ lat, long });
        },
        (error) => {
          console.error("Eroare la obținerea locației:", error.message);
          setLocation(null);
        }
      );
    } else {
      console.log("Geolocația nu este disponibilă în acest browser.");
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (parola !== confirmaParola) {
      setMessage("Parolele nu coincid!");
      setIsError(true);
      return;
    }

    const requestData = {
      firstname: prenume,
      lastname: nume,
      email,
      password: parola,
      location: location ? `${location.lat}, ${location.long}` : null,
    };

    console.log("Sending request data:", requestData);

    try {
      await axios.post("http://localhost:5000/api/users/register", requestData);
      setIsError(false);
      setMessage("Cont creat cu succes!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "A apărut o eroare la înregistrare."
      );
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full p-8">
        <div className="mb-8 text-center">
          <img src={Logo} alt="Fresco" className="h-12 mx-auto mb-12" />
          <h1 className="text-2xl font-bold text-gray-800">Creează cont nou</h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full">
              <label
                htmlFor="prenume"
                className="block text-sm font-medium text-gray-700"
              >
                Prenume <span className="text-red-500">*</span>
              </label>
              <input
                id="prenume"
                type="text"
                required
                placeholder="ex: Ana-Maria"
                className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
                value={prenume}
                onChange={(e) => setPrenume(e.target.value)}
              />
            </div>
            <div className="w-full md:mt-0">
              <label
                htmlFor="nume"
                className="block text-sm font-medium text-gray-700"
              >
                Nume <span className="text-red-500">*</span>
              </label>
              <input
                id="nume"
                type="text"
                required
                placeholder="ex: Ionita"
                className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
                value={nume}
                onChange={(e) => setNume(e.target.value)}
              />
            </div>
          </div>

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
              placeholder="ex: ana.ionita@gmail.com"
              className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="parola"
              className="block text-sm font-medium text-gray-700"
            >
              Parola <span className="text-red-500">*</span>
            </label>
            <input
              id="parola"
              type="password"
              required
              placeholder="********"
              className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirmaParola"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmă parola <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmaParola"
              type="password"
              required
              placeholder="********"
              className="mt-1 w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-600"
              value={confirmaParola}
              onChange={(e) => setConfirmaParola(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-green-700 text-white rounded shadow 
                       hover:bg-green-800 transition font-semibold"
          >
            Creează cont
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

        <p className="mt-6 text-center text-sm text-gray-700">
          Ai deja cont Fresco?{" "}
          <a
            href="/login"
            className="text-green-700 font-medium hover:underline"
          >
            Autentifică-te
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
