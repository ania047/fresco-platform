import express from "express";
import db from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const {
    userId,
    deliveryMethod,
    cartItems,
    totalPrice,
    paymentMethod,
    deliveryDetails,
  } = req.body;

  if (!userId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Comanda este invalidă" });
  }

  try {
    const orderResult = await db.query(
      "INSERT INTO orders (user_id, total_price, delivery_method, payment_method, delivery_details, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id",
      [userId, totalPrice, deliveryMethod, paymentMethod, deliveryDetails]
    );

    const orderId = orderResult.rows[0].id;

    const orderItemsPromises = cartItems.map((item) =>
      db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      )
    );

    await Promise.all(orderItemsPromises);

    await db.query("DELETE FROM cart WHERE user_id = $1", [userId]);

    res.status(201).json({ message: "Comanda a fost plasată!", orderId });
  } catch (error) {
    console.error("Eroare la plasarea comenzii:", error);
    res.status(500).json({ message: "Eroare la plasarea comenzii" });
  }
});

router.get("/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const ordersResult = await db.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    const orders = ordersResult.rows;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemsResult = await db.query(
          `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
          [order.id]
        );

        order.items = itemsResult.rows;
        return order;
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error("Eroare la obținerea comenzilor:", error);
    res.status(500).json({ message: "Eroare la obținerea comenzilor" });
  }
});

export default router;
