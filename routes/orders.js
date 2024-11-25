const express = require("express");
const authMiddleware = require("../middleware/auth.js");
const { Order, validateOrder } = require("../models/order.js");
const { Product } = require("../models/product.js"); // Use destructuring here
const sendOrderConfirmationEmail = require("../services/emailService.js");
console.log("Product model:", Product); // This should now display the model object in the console
const router = express.Router();

// Create a new order
router.post("/", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { items, name, email, phone, address, paymentMethod } = req.body;
  const { error } = validateOrder({
    userId,
    items,
    totalCents: req.body.totalCents,
    name,
    email,
    phone,
    address,
    paymentMethod,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    let totalCents = 0;
    const orderItems = [];

    for (const item of items) {
      // Fetch product to get complete details (name, price, etc.)
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }
      const itemTotal = product.priceCents * item.quantity;
      totalCents += itemTotal;

      // Add product details to each item
      orderItems.push({
        productId: product._id,
        name: product.name, // Include name for email display
        quantity: item.quantity,
        priceCents: product.priceCents,
      });
    }

    const order = new Order({
      userId,
      items: orderItems,
      totalCents,
      name,
      email,
      phone,
      address,
      paymentMethod,
    });
    await order.save();

    // Send email and SMS notifications
    await sendOrderConfirmationEmail(email, order);
    //await sendOrderConfirmationSMS(phone, order);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get orders for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const orders = await Order.find({ userId }).populate(
      "items.productId",
      "name image priceCents"
    );
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
