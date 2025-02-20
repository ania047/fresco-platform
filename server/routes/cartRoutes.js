import express from "express";
import * as cartController from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", cartController.getCart);

router.post("/", cartController.addProductToCart);

router.put("/:productId", cartController.updateProductQuantity);

router.delete("/:userId/:productId", cartController.removeProductFromCart);

export default router;
