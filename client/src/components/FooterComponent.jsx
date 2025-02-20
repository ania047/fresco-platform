import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-24">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Fresco. Toate drepturile
            rezervate.
          </p>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-white hover:text-gray-400">
            <FaFacebookF />
          </a>
          <a href="#" className="text-white hover:text-gray-400">
            <FaYoutube />
          </a>
          <a href="#" className="text-white hover:text-gray-400">
            <FaTwitter />
          </a>
          <a href="#" className="text-white hover:text-gray-400">
            <FaInstagram />
          </a>
        </div>
      </div>
      <button
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        &uarr;
      </button>
    </footer>
  );
};

export default Footer;
