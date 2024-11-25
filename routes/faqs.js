const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Serve FAQs from a JSON file
router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../data/faqs.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading FAQs:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(JSON.parse(data));
  });
});

module.exports = router;
