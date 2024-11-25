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
  const { q1: room, q2: style, q3: budget } = quizAnswers;

  // Define recommendations based on room and style
  const recommendations = {
    living: {
      modern: {
        budget:
          "Consider our modern living room essentials under $500, perfect for a stylish yet affordable setup.",
        "mid-range":
          "A sleek sofa set with matching coffee tables would be ideal for a contemporary look in your living room.",
        "high-end":
          "Our premium sectional sofas and minimalist coffee tables in leather and steel make a bold statement.",
      },
      classic: {
        budget:
          "Explore classic living room chairs and sofas under $500 that offer elegance and comfort.",
        "mid-range":
          "Consider our curated collection of classic wooden coffee tables and plush armchairs.",
        "high-end":
          "Our luxury handcrafted sofas and vintage armoires create a timeless classic atmosphere in your living room.",
      },
      rustic: {
        budget:
          "Our rustic coffee tables and wooden chairs under $500 are perfect for a cozy, farmhouse-style living room.",
        "mid-range":
          "Opt for solid wood furniture and earthy tones to add warmth to your rustic-themed living room.",
        "high-end":
          "Our reclaimed wood and artisan-crafted sofas bring a high-end rustic feel to your living room.",
      },
      minimalist: {
        budget:
          "Check out our minimalist coffee tables and compact seating options under $500 for small living spaces.",
        "mid-range":
          "Our modular sofas and sleek side tables offer functionality without compromising on style.",
        "high-end":
          "Discover minimalist, high-end furniture with clean lines, featuring materials like glass, steel, and wood.",
      },
    },
    bedroom: {
      modern: {
        budget:
          "Try our modern bed frames and simple nightstands for a stylish yet affordable bedroom look.",
        "mid-range":
          "Our bed frames and dresser sets bring modern elegance and storage to your bedroom.",
        "high-end":
          "Our high-end bedroom sets include memory foam mattresses and LED bed frames for a luxurious experience.",
      },
      classic: {
        budget:
          "Consider our traditional wooden bed frames and elegant nightstands for a classic look.",
        "mid-range":
          "Explore bedroom sets with ornate detailing and high-quality wood for a timeless appeal.",
        "high-end":
          "Our premium mahogany bedroom furniture provides an opulent, classic aesthetic.",
      },
      rustic: {
        budget:
          "Our rustic bed frames and wooden nightstands bring charm to any bedroom at an affordable price.",
        "mid-range":
          "Consider furniture with reclaimed wood for an eco-friendly, rustic bedroom feel.",
        "high-end":
          "Our rustic luxury pieces, crafted from reclaimed wood and metal, are perfect for a high-end farmhouse look.",
      },
      minimalist: {
        budget:
          "Opt for our minimalist bed frames and compact storage solutions for a simple bedroom setup.",
        "mid-range":
          "Our sleek platform beds and Scandinavian-inspired dressers are ideal for a modern minimalist look.",
        "high-end":
          "Our premium minimalist collection features space-saving, high-quality materials for a luxurious look.",
      },
    },
    dining: {
      modern: {
        budget:
          "Our modern dining chairs and compact tables are perfect for a small budget and stylish dining area.",
        "mid-range":
          "Choose from mid-range, contemporary dining sets that offer style and comfort.",
        "high-end":
          "Our high-end glass-top dining tables and leather chairs create a sophisticated dining experience.",
      },
      classic: {
        budget:
          "Try our classic wood dining chairs for an elegant touch on a budget.",
        "mid-range":
          "Our oak dining tables and upholstered chairs bring traditional elegance to your dining space.",
        "high-end":
          "Our luxury dining sets crafted from high-quality wood bring timeless sophistication.",
      },
      rustic: {
        budget:
          "Our rustic dining tables and benches bring warmth to any dining room without breaking the bank.",
        "mid-range":
          "Solid wood tables with earthy textures make a perfect rustic dining room setting.",
        "high-end":
          "Our handcrafted wood and metal dining sets are ideal for an upscale rustic ambiance.",
      },
      minimalist: {
        budget:
          "Opt for simple, space-efficient dining sets with clean lines for a minimalist dining area.",
        "mid-range":
          "Our Scandinavian-style dining sets offer simplicity and elegance in the mid-range price bracket.",
        "high-end":
          "Our minimalist, high-end dining tables and chairs offer premium materials and aesthetic design.",
      },
    },
    office: {
      modern: {
        budget:
          "Check out our modern office desks and ergonomic chairs, affordable yet stylish.",
        "mid-range":
          "Mid-range desks with built-in cable management and modern aesthetics for productivity.",
        "high-end":
          "Explore our high-end standing desks and executive chairs for a modern, luxurious office feel.",
      },
      classic: {
        budget:
          "Consider traditional wood office desks and comfortable chairs for a professional look on a budget.",
        "mid-range":
          "Classic, sturdy wooden desks and leather chairs bring elegance to a home office.",
        "high-end":
          "Our premium oak desks and leather executive chairs are perfect for a classic office setting.",
      },
      rustic: {
        budget:
          "Our affordable rustic desks and shelves are perfect for a cozy, farmhouse-style office.",
        "mid-range":
          "Reclaimed wood desks and industrial chairs create a rustic yet functional workspace.",
        "high-end":
          "Our luxury rustic office pieces combine reclaimed wood and metal for a high-end farmhouse office look.",
      },
      minimalist: {
        budget:
          "Opt for our compact office desks and simple chairs for a minimalist office setup.",
        "mid-range":
          "Explore sleek and functional mid-range desks ideal for a minimalist workspace.",
        "high-end":
          "Our high-end minimalist office furniture combines clean lines and premium materials for an upscale look.",
      },
    },
  };

  // Return a recommendation based on room, style, and budget
  return (
    recommendations[room]?.[style]?.[budget] ||
    "Explore our curated furniture collection for your ideal style."
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
      subject: "Your Personalized Furniture Recommendation",
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
