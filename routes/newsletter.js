const express = require("express");
const router = express.Router();
const {
  NewsletterEmail,
  validateNewsletterEmail,
} = require("../models/newsletter.js");

// POST route for newsletter subscription
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  // Validate email directly as a string
  const { error } = validateNewsletterEmail(email); // <- Pass email directly
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    // Check if the email already exists
    const existingSubscriber = await NewsletterEmail.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: "You're already subscribed!" });
    }

    // Save email to the database
    const newSubscriber = new NewsletterEmail({ email });
    await newSubscriber.save();

    res.status(200).json({ message: "Thank you for subscribing!" });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ message: "Failed to subscribe. Please try again." });
  }
});

module.exports = router;
