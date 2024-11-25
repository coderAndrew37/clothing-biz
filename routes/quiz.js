require("dotenv").config();
const express = require("express");
const router = express.Router();
const connectToDatabase = require("../startup/db");
const { Lead, validateLead } = require("../models/lead");
const nodemailer = require("nodemailer");
const xss = require("xss");
const moment = require("moment");

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Helper function to check the daily submission limit
async function checkDailySubmissionLimit(email) {
  const startOfDay = moment().startOf("day").toDate();
  const submissionsToday = await Lead.countDocuments({
    email,
    createdAt: { $gte: startOfDay },
  });
  return submissionsToday >= 3;
}

// Generates personalized recommendations based on quiz answers
function generateRecommendation(quizAnswers) {
  const { q1: productType, q2: material, q3: budget } = quizAnswers;

  // Define recommendations based on product type, material, and budget
  const recommendations = {
    jackets: {
      "genuine leather": {
        "below 3000 ksh":
          "Check out our affordable faux leather jackets, perfect for budget-conscious style enthusiasts.",
        "3000 - 10000 ksh":
          "Our genuine leather jackets in classic and modern designs are a great choice.",
        "above 10000 ksh":
          "Discover our premium handcrafted leather jackets, combining style and durability.",
      },
      denim: {
        "below 3000 ksh":
          "Explore our budget-friendly denim jackets, ideal for casual wear.",
        "3000 - 10000 ksh":
          "Our stylish and durable denim jackets fit both your budget and fashion needs.",
        "above 10000 ksh":
          "Try our designer denim jackets with premium finishes for a luxury feel.",
      },
    },
    shoes: {
      "genuine leather": {
        "below 3000 ksh":
          "Our faux leather shoes offer a sleek look at an affordable price.",
        "3000 - 10000 ksh":
          "Choose from our range of genuine leather shoes that balance comfort and quality.",
        "above 10000 ksh":
          "Experience luxury with our handmade premium leather shoes.",
      },
      synthetic: {
        "below 3000 ksh":
          "Our synthetic shoes are lightweight, affordable, and stylish.",
        "3000 - 10000 ksh":
          "Try our high-quality synthetic leather shoes, perfect for casual or formal occasions.",
        "above 10000 ksh":
          "Explore premium synthetic materials with modern designs in our high-end collection.",
      },
    },
    bags: {
      "genuine leather": {
        "below 3000 ksh":
          "Discover compact and stylish leather-inspired bags for an affordable price.",
        "3000 - 10000 ksh":
          "Our genuine leather handbags and sling bags offer durability and elegance.",
        "above 10000 ksh":
          "Indulge in our premium handcrafted leather bags, perfect for a luxurious statement.",
      },
      cotton: {
        "below 3000 ksh":
          "Our budget-friendly cotton totes and backpacks are practical and eco-friendly.",
        "3000 - 10000 ksh":
          "Choose from our durable cotton blend bags, great for everyday use.",
        "above 10000 ksh":
          "Try our premium cotton-crafted designer bags for both style and sustainability.",
      },
    },
    accessories: {
      "genuine leather": {
        "below 3000 ksh":
          "Check out our stylish and affordable leather wallets and belts.",
        "3000 - 10000 ksh":
          "Our high-quality leather gloves, belts, and wallets are practical and elegant.",
        "above 10000 ksh":
          "Discover our exclusive range of luxury leather accessories for the discerning buyer.",
      },
      synthetic: {
        "below 3000 ksh":
          "Explore our budget-friendly synthetic belts and wallets.",
        "3000 - 10000 ksh":
          "Try our durable synthetic accessories, perfect for a polished look.",
        "above 10000 ksh":
          "Opt for premium synthetic accessories that combine style and functionality.",
      },
    },
  };

  // Return a recommendation based on product type, material, and budget
  return (
    recommendations[productType]?.[material]?.[budget] ||
    "Explore our curated clothing and leather collection for your style."
  );
}

// API route to handle quiz submission
router.post("/", async (req, res) => {
  await connectToDatabase();

  // Check request method
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Validate input data
  const { error } = validateLead(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Extract and sanitize data
  const email = xss(req.body.email);
  const quizAnswers = req.body.quizAnswers;

  try {
    // Check daily submission limit
    if (await checkDailySubmissionLimit(email)) {
      return res.status(400).json({ error: "Daily submission limit reached." });
    }

    // Generate recommendation and save lead to database
    const recommendation = generateRecommendation(quizAnswers);
    const lead = new Lead({
      email,
      quizAnswers,
      verified: true,
      createdAt: new Date(),
    });
    await lead.save();

    // Send email with recommendation
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Personalized Clothing & Leather Recommendation",
      text: `Thank you for taking our quiz! Here is your recommendation: ${recommendation}`,
    });

    // Respond with recommendation message
    res
      .status(200)
      .json({ message: "Quiz submitted successfully.", recommendation });
  } catch (error) {
    console.error("Quiz submission error:", error);
    res.status(500).json({ error: "Failed to submit the quiz" });
  }
});

module.exports = router;
