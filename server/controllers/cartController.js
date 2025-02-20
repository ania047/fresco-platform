import * as cartModel from "../models/cartModels.js";

export const getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await cartModel.getCartByUserId(userId);
    console.log("Produse returnate din coș:", cart);

    if (!cart || cart.length === 0) {
      return res.status(404).json({ message: "Coșul este gol" });
    }

    res.json(cart);
  } catch (error) {
    console.error("Eroare la preluarea coșului:", error);
    res.status(500).json({ message: "Eroare la preluarea coșului." });
  }
};

export const addProductToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const existingProduct = await cartModel.getCartItem(userId, productId);

    if (existingProduct) {
      const updatedProduct = await cartModel.updateCartQuantity(
        userId,
        productId,
        existingProduct.quantity + quantity
      );
      return res.json(updatedProduct);
    } else {
      const newProduct = await cartModel.addToCart(userId, productId, quantity);
      return res.json(newProduct);
    }
  } catch (error) {
    console.error("Eroare la adăugarea produsului:", error);
    res.status(500).json({ message: "Eroare la adăugarea produsului în coș" });
  }
};

export const updateProductQuantity = async (req, res) => {
  const { productId } = req.params;
  const { userId, quantity } = req.body;
  try {
    const product = await cartModel.updateCartQuantity(
      userId,
      productId,
      quantity
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart quantity" });
  }
};

export const removeProductFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const removedItem = await cartModel.removeFromCart(userId, productId);
    if (!removedItem) {
      return res
        .status(404)
        .json({ message: "Produsul nu se găsește în coș." });
    }
    res.json({ message: "Produs șters din coș.", removedItem });
  } catch (error) {
    console.error("Error in removeProductFromCart:", error);
    res
      .status(500)
      .json({ error: "A apărut o eroare la ștergerea produsului din coș." });
  }
};
