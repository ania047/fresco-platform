import React, { useState, useRef } from "react";
import axios from "axios";
import { LoadScript, GoogleMap } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const mapOptions = {
  mapId: "ab9b66fd05bc3192",
};

const defaultCenter = {
  lat: 44.4268,
  lng: 26.1025,
};

const AddProductForm = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(defaultCenter);
  const [message, setMessage] = useState("");

  const mapRef = useRef(null);

  const handleMapLoad = (map) => {
    mapRef.current = map;

    map.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedLocation({ lat, lng });
      setLocation(`${lat}, ${lng}`);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Nu există token, acces interzis.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/products",
        {
          name,
          category,
          brand,
          description,
          price,
          expiry_date: expiryDate,
          discount,
          image_url: imageUrl,
          location: `${selectedLocation.lat}, ${selectedLocation.lng}`,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (response.data) {
        setMessage("Produs adăugat cu succes!");
        setName("");
        setCategory("");
        setBrand("");
        setDescription("");
        setPrice("");
        setExpiryDate("");
        setDiscount("");
        setImageUrl("");
        setLocation("");
        setSelectedLocation(defaultCenter);
      } else {
        setMessage("Eroare: Nu există date de răspuns de la server.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Eroare la adăugarea produsului."
      );
    }
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">Adaugă un produs</h2>
          <form onSubmit={handleSubmit}>
            {/* Linia 1: Nume & Marcă */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="productName" className="form-label">
                  Nume produs
                </label>
                <input
                  id="productName"
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Introduceți numele produsului"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="productBrand" className="form-label">
                  Marcă
                </label>
                <input
                  id="productBrand"
                  type="text"
                  className="form-control"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Introduceți marca produsului"
                  required
                />
              </div>
            </div>

            {/* Linia 2: Categorie & Reducere */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="productCategory" className="form-label">
                  Categorie
                </label>
                <input
                  id="productCategory"
                  type="text"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Introduceți categoria produsului"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="productDiscount" className="form-label">
                  Discount (%)
                </label>
                <input
                  id="productDiscount"
                  type="number"
                  className="form-control"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Introduceți discountul produsului"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Linia 3: Preț & Data expirării */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="productPrice" className="form-label">
                  Preț
                </label>
                <input
                  id="productPrice"
                  type="number"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Introduceți prețul produsului"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="expiryDate" className="form-label">
                  Data expirării
                </label>
                <input
                  id="expiryDate"
                  type="date"
                  className="form-control"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Linia 4: URL imagine & Locație */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="productImageUrl" className="form-label">
                  URL imagine
                </label>
                <input
                  id="productImageUrl"
                  type="text"
                  className="form-control"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Introduceți URL-ul imaginii produsului"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="productLocation" className="form-label">
                  Locație
                </label>
                <input
                  id="productLocation"
                  type="text"
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Introduceți sau selectați locația"
                />
              </div>
            </div>

            {/* Linia 5: Descriere */}
            <div className="row mb-3">
              <div className="col-12">
                <label htmlFor="productDescription" className="form-label">
                  Descriere
                </label>
                <textarea
                  id="productDescription"
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Introduceți descrierea produsului"
                  required
                />
              </div>
            </div>

            {/* Harta */}
            <div className="mb-3">
              <LoadScript
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={selectedLocation}
                  zoom={15}
                  options={mapOptions}
                  onLoad={handleMapLoad}
                />
              </LoadScript>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Adaugă produs
            </button>

            {message && (
              <div className="alert alert-info mt-3" role="alert">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
