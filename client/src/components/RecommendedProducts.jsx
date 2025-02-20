import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaBasketShopping } from "react-icons/fa6";

const RecommendedProducts = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setItemsPerSlide(1);
      } else if (width < 1024) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(3);
      }
    };

    updateItemsPerSlide();

    window.addEventListener("resize", updateItemsPerSlide);

    return () => {
      window.removeEventListener("resize", updateItemsPerSlide);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchRecommendedProducts = async () => {
      setLoading(true);
      try {
        const userToken = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/recommendations",
          {
            params: { user_id: userId },
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        console.log("Răspuns recomandări:", response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Eroare la obținerea recomandărilor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [userId]);

  const slides = [];
  for (let i = 0; i < products.length; i += itemsPerSlide) {
    slides.push(products.slice(i, i + itemsPerSlide));
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return <p className="text-center">Se încarcă recomandările...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center">Nu există produse recomandate.</p>;
  }

  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <h2 className="text-2xl text-center font-bold mb-4">
        Produse recomandate
      </h2>
      {slides.length > 0 && (
        <div className="relative flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FaChevronLeft size={24} />
          </button>

          <div className="flex space-x-6 justify-center flex-grow mx-4">
            {slides[currentIndex].map((product) => (
              <div
                key={product.id}
                className="bg-white rounded shadow flex items-center p-4 w-full max-w-md"
              >
                <img
                  src={product.image_url || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded mr-4"
                />

                <div className="flex flex-col flex-grow">
                  <h3 className="font-semibold text-sm text-gray-800">
                    {product.name}
                  </h3>

                  {product.discount ? (
                    <div className="mt-1">
                      <span className="line-through text-sm text-gray-500 mr-2">
                        {product.original_price} lei
                      </span>
                      <span className="font-bold text-sm">
                        {product.price.toFixed(2)} lei
                      </span>
                      <span className="ml-2 text-xs font-bold text-red-600 bg-red-200 px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 font-bold text-sm">
                      {product.price.toFixed(2)} lei
                    </p>
                  )}
                </div>

                <button
                  onClick={() => console.log("Adăugat în coș:", product)}
                  className="ml-4 flex items-center space-x-1 text-green-500 px-4 mt-10"
                >
                  <FaBasketShopping className="text-xl" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FaChevronRight size={24} />
          </button>
        </div>
      )}

      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, slideIndex) => (
          <div
            key={slideIndex}
            className={`w-2 h-2 rounded-full ${
              slideIndex === currentIndex ? "bg-blue-700" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
