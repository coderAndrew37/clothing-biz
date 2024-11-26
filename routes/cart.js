const express = require("express");
const authMiddleware = require("../middleware/auth.js");
const router = express.Router();
const User = require("../models/user.js");
const DeliveryOption = require("../models/deiveryOption.js");

// Fetch the products in the cart with delivery options
router.get("/get-cart", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Retrieve delivery options; return an empty array if none found
    const deliveryOptions = (await DeliveryOption.find()) || [];

    res.status(200).json({
      cart: user.cart,
      deliveryOptions,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Add product to the user's cart
router.post("/add-to-cart", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate productId and quantity
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid or missing product ID." });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the product already exists in the cart
    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    res.status(200).json({
      message: "Product added/updated in cart successfully.",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error adding/updating product in cart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update product quantity in the cart
router.put("/update-cart", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product ID or quantity." });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    // Update quantity
    cartItem.quantity = quantity;

    await user.save();
    res
      .status(200)
      .json({ message: "Cart updated successfully.", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Remove product from the cart
router.delete(
  "/remove-from-cart/:productId",
  authMiddleware,
  async (req, res) => {
    const { productId } = req.params;

    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Remove product from cart
      user.cart = user.cart.filter(
        (item) => item.productId.toString() !== productId
      );

      await user.save();
      res
        .status(200)
        .json({ message: "Product removed from cart.", cart: user.cart });
    } catch (error) {
      console.error("Error removing product from cart:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

module.exports = router;
