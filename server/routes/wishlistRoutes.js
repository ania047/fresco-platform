import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { rows } = await db.query(
      "SELECT p.* FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = $1",
      [userId]
    );

    //console.log("Wishlist data:", rows);

    res.json(rows);
  } catch (error) {
    console.error("Eroare la obținerea listei de dorințe:", error);
    res.status(500).json({ message: "Eroare server", error: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: "Lipsesc userId sau productId." });
  }

  try {
    await db.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, productId]
    );
    res.json({ message: "Produs adăugat în wishlist!" });
  } catch (error) {
    console.error("Eroare la adăugarea în wishlist:", error);
    res.status(500).json({ message: "Eroare internă." });
  }
});

router.delete("/:userId/:productId", authMiddleware, async (req, res) => {
  const { userId, productId } = req.params;

  try {
    await db.query(
      "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
    res.json({ message: "Produs eliminat din wishlist" });
  } catch (error) {
    console.error("Eroare la ștergerea produsului:", error);
    res.status(500).json({ message: "Eroare server" });
  }
});

export default router;
