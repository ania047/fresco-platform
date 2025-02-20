import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password, location } = req.body;

  console.log("User Data:", { firstname, lastname, email, password, location });

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (firstname, lastname, email, password, sign_up_date, location) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)",
      [firstname, lastname, email, hashedPassword, location]
    );

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send("Server error");
  }
});

export default router;
