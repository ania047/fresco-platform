import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Platforma este online!");
});

import userRoutes from "./routes/userRoutes.js";
app.use("/api/users", userRoutes);

import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

import productRoutes from "./routes/productRoutes.js";
app.use("/api/products", productRoutes);

import cartRoutes from "./routes/cartRoutes.js";
app.use("/api/cart", cartRoutes);

import wishlistRoutes from "./routes/wishlistRoutes.js";
app.use("/api/wishlist", wishlistRoutes);

import orderRoutes from "./routes/orderRoutes.js";
app.use("/api/orders", orderRoutes);

app.get("/api/recommendations", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    const userId = decoded.user.id;
    console.log("Extracted user_id:", userId);

    const response = await axios.get(
      `http://localhost:5001/api/recommendations`,
      {
        params: { user_id: userId },
      }
    );

    console.log("Response from Python service:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Error fetching recommendations" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
