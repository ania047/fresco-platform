import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { LoadScript, GoogleMap } from "@react-google-maps/api";
import ProductList from "./ProductList";
import CartModal from "./CartModal";
import "../css/Home.css";

const mapOptions = {
  mapId: "ab9b66fd05bc3192",
};

const defaultCenter = {
  lat: 44.4268,
  lng: 26.1025,
};

const Home = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const mapRef = useRef(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const markersRef = useRef([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Eroare la obținerea locației utilizatorului:", error);
        }
      );
    }
  }, []);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return decoded?.user?.id;
    } catch (error) {
      console.error("Token invalid:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        const fetchedProducts = response.data;

        const validProducts = fetchedProducts.filter((product) => {
          const coords = product.location.split(",").map(Number);
          return coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
        });

        const grouped = {};
        validProducts.forEach((product) => {
          const [lat, lng] = product.location.split(",").map(Number);
          const key = `${lat},${lng}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(product);
        });

        setGroupedProducts(grouped);
      } catch (error) {
        console.error("Eroare la preluarea produselor:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const createMarkers = async () => {
      markersRef.current.forEach((marker) => (marker.map = null));
      markersRef.current = [];

      const { AdvancedMarkerElement } = await window.google.maps.importLibrary(
        "marker"
      );

      if (userLocation) {
        const userMarker = new AdvancedMarkerElement({
          map: mapRef.current,
          position: userLocation,
          title: "Locația ta",
        });
        markersRef.current.push(userMarker);
      }

      Object.entries(groupedProducts).forEach(([key, products]) => {
        const [latitude, longitude] = key.split(",").map(Number);

        const marker = new AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: latitude, lng: longitude },
          title: `Produse: ${products.length}`,
        });

        marker.addListener("click", () => {
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            products: products,
          });
        });

        markersRef.current.push(marker);
      });
    };

    createMarkers();
  }, [groupedProducts, userLocation]);

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
    }
  }, [userLocation]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const addToCart = async (product, quantity = 1) => {
    const userId = getUserIdFromToken();
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      console.error("Trebuie să fii autentificat pentru a adăuga în coș.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/cart",
        {
          userId,
          productId: product.id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data.message);

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevItems, { ...product, quantity }];
        }
      });

      setIsCartModalOpen(true);
    } catch (err) {
      console.error("Eroare la adăugarea în coș:", err);
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      const userId = getUserIdFromToken();
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        console.error(
          "Utilizatorul nu este autentificat. Nu putem prelua coșul."
        );
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/cart/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Produse din coș:", response.data);
        setCartItems(response.data);
      } catch (err) {
        console.error("Eroare la obținerea produselor din coș:", err);
      }
    };

    fetchCartItems();
  }, []);

  return (
    <div className="mt-32 flex flex-col md:flex-row h-screen w-screen">
      <div className="sidebar w-full md:w-1/3 h-1/2 md:h-3/4 overflow-auto px-4">
        <h3 className="font-bold text-xl mb-2">Produse</h3>
        {selectedLocation ? (
          <div className="location-details">
            <ProductList
              products={selectedLocation.products}
              addToCart={addToCart}
            />
          </div>
        ) : (
          <p>Selectează un marker de pe hartă pentru a vedea produsele.</p>
        )}
      </div>

      <div className="map-wrapper w-full md:w-2/3 h-1/2 md:h-screen">
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        >
          <GoogleMap
            mapContainerStyle={{ width: "95%", height: "100%" }}
            zoom={13}
            center={userLocation || defaultCenter}
            options={mapOptions}
            onLoad={handleMapLoad}
          />
        </LoadScript>
      </div>

      {isCartModalOpen && (
        <CartModal
          cartItems={cartItems}
          closeModal={() => setIsCartModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
