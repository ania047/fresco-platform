import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaBookOpen,
  FaUser,
  FaShoppingCart,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";
import IconProfile from "../assets/icons/icon-user.svg";
import IconMap from "../assets/icons/icon-map.svg";
import IconOrder from "../assets/icons/icon-order.svg";
import IconWishlist from "../assets/icons/icon-wishlist.svg";
import IconLogout from "../assets/icons/icon-logout.svg";
import Logo from "../assets/logo.png";
import CartModal from "./CartModal";
import { useNavigate } from "react-router-dom";

function Header() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFirstname = localStorage.getItem("firstname");
    const storedLastname = localStorage.getItem("lastname");

    if (storedFirstname && storedLastname) {
      setFirstname(storedFirstname);
      setLastname(storedLastname);
    }
  }, []);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    setFirstname("");
    setLastname("");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img
            src={Logo}
            alt="Logo"
            className="w-1/4 h-1/4 object-contain mr-2"
          />
        </div>

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <nav className="hidden md:flex items-center space-x-3">
          <a
            href="/add-product"
            className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <FaMapMarkerAlt className="text-gray-500" />
            <span className="text-sm font-medium">Adaugă un punct</span>
          </a>

          <a
            href="/consiliere"
            className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <FaBookOpen className="text-gray-500" />
            <span className="text-sm font-medium">Sfaturi</span>
          </a>

          <button
            onClick={toggleModal}
            className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <FaShoppingCart className="text-gray-500" />
            <span className="text-sm font-medium">Coșul meu</span>
          </button>

          {!firstname && !lastname ? (
            <a
              href="/login"
              className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition ml-6"
            >
              <FaUser className="text-gray-500" />
              <span className="text-sm font-medium">Autentifică-te</span>
            </a>
          ) : (
            <div className="relative ml-6">
              <IoPersonCircle
                className="text-3xl text-gray-700 cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white shadow-lg rounded-lg border z-50">
                  <div className="absolute top-[-10px] right-4 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-300"></div>

                  <div className="p-4">
                    <p className="text-lg font-semibold text-gray-700">
                      Salut, {firstname} {lastname}!
                    </p>
                  </div>

                  <ul>
                    <li>
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center w-full text-left text-gray-700 hover:bg-gray-100 py-2"
                      >
                        <img
                          src={IconProfile}
                          alt="Profil"
                          className="w-5 h-5 mr-2"
                        />
                        Profil
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigate("/addresses")}
                        className="flex items-center w-full text-left text-gray-700 hover:bg-gray-100 py-2"
                      >
                        <img
                          src={IconMap}
                          alt="Adrese"
                          className="w-5 h-5 mr-2"
                        />
                        Adrese
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigate("/orders")}
                        className="flex items-center w-full text-left text-gray-700 hover:bg-gray-100 py-2"
                      >
                        <img
                          src={IconOrder}
                          alt="Comenzi"
                          className="w-5 h-5 mr-2"
                        />
                        Comenzi
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigate("/wishlist")}
                        className="flex items-center w-full text-left text-gray-700 hover:bg-gray-100 py-2"
                      >
                        <img
                          src={IconWishlist}
                          alt="Wishlist"
                          className="w-5 h-5 mr-2"
                        />
                        Favorite
                      </button>
                    </li>
                  </ul>

                  <div className="p-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left text-red-600 font-medium hover:bg-gray-100 py-2"
                    >
                      <img
                        src={IconLogout}
                        alt="Deconectare"
                        className="w-5 h-5 mr-2"
                      />
                      Deconectare
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Meniu mobil */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col space-y-3">
          {!firstname && !lastname ? (
            <a
              href="/login"
              className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition"
            >
              <FaUser className="text-gray-500" />
              <span className="text-sm font-medium">Autentifică-te</span>
            </a>
          ) : (
            <>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <IoPersonCircle className="text-3xl text-gray-700" />
                <span className="text-sm font-medium">
                  Salut, {firstname} {lastname}!
                </span>
              </div>
              {dropdownOpen && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex flex-col space-y-2">
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center text-gray-700 hover:bg-gray-100 px-2 py-1"
                  >
                    <img
                      src={IconProfile}
                      alt="Profil"
                      className="w-4 h-4 mr-2"
                    />
                    Profil
                  </button>
                  <button
                    onClick={() => navigate("/addresses")}
                    className="flex items-center text-gray-700 hover:bg-gray-100 px-2 py-1"
                  >
                    <img src={IconMap} alt="Adrese" className="w-4 h-4 mr-2" />
                    Adrese
                  </button>
                  <button
                    onClick={() => navigate("/orders")}
                    className="flex items-center text-gray-700 hover:bg-gray-100 px-2 py-1"
                  >
                    <img
                      src={IconOrder}
                      alt="Comenzi"
                      className="w-4 h-4 mr-2"
                    />
                    Comenzi
                  </button>
                  <button
                    onClick={() => navigate("/wishlist")}
                    className="flex items-center text-gray-700 hover:bg-gray-100 px-2 py-1"
                  >
                    <img
                      src={IconWishlist}
                      alt="Wishlist"
                      className="w-4 h-4 mr-2"
                    />
                    Favorite
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:bg-gray-100 px-2 py-1"
                  >
                    <img
                      src={IconLogout}
                      alt="Deconectare"
                      className="w-4 h-4 mr-2"
                    />
                    Deconectare
                  </button>
                </div>
              )}
            </>
          )}
          <a
            href="/add-product"
            className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <FaMapMarkerAlt className="text-gray-500" />
            <span className="text-sm font-medium">Adaugă un punct</span>
          </a>

          <a
            href="/consiliere"
            className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <FaBookOpen className="text-gray-500" />
            <span className="text-sm font-medium">Sfaturi</span>
          </a>

          <button
            onClick={toggleModal}
            className="inline-flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <FaShoppingCart className="text-gray-500" />
            <span className="text-sm font-medium">Coșul meu</span>
          </button>
        </div>
      )}

      {isModalOpen && <CartModal closeModal={toggleModal} />}
    </header>
  );
}

export default Header;
