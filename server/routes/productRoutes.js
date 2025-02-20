import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import axios from "axios";

const router = express.Router();

const getCoordinates = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error("Failed to get coordinates from Google API");
    }

    const { lat, lng } = response.data.results[0].geometry.location;
    return { lat, lng };
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw new Error("Failed to get coordinates from Google API");
  }
};

router.post("/", async (req, res) => {
  const { name, category, description, brand, price, expiry_date, location } =
    req.body;

  console.log("Received Data:", {
    name,
    category,
    description,
    brand,
    price,
    expiry_date,
    location,
  });

  try {
    await db.query(
      "INSERT INTO products (name, category, description, brand, price, expiry_date, location) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [name, category, description, brand, price, expiry_date, location]
    );

    return res.status(201).json({ message: "Product added successfully!" });
  } catch (err) {
    console.error("Error adding product:", err.message);
    res.status(500).json({ message: "Error adding product" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products");

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await db.query(
      "DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user]
    );

    if (!deleteProduct.rows.length) {
      return res.status(404).json({
        message:
          "Product not found or you are not authorized to delete this product",
      });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
