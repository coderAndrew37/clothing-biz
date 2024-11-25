// routes/contact.js
const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const router = express.Router();

// Configure rate limiter for daily limit (3 submissions per day)
const dailyLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each IP to 3 requests per day
  message: "You have reached the daily submission limit. Try again tomorrow.",
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Contact Form Route with daily limit and Joi validation
router.post("/", dailyLimit, async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input data with Joi
  const { error } = require("../models/contact.js").validateContact({
    name,
    email,
    message,
  });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Save lead to database
    await require("../models/contact.js").create({ name, email, message });

    // Send email notification
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Acknowledge email to user
    await transporter.sendMail({
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting us",
      html: `
        <h1>Thank you, ${name}!</h1>
        <p>We received your message and will get back to you shortly.</p>
        <p>Here's a copy of your message:</p>
        <blockquote>${message}</blockquote>
        <p>Best Regards,<br>Your Company</p>
      `,
    });

    // Respond with success message
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending email or saving lead:", error);
    res
      .status(500)
      .json({ message: "Failed to send message, try again later" });
  }
});

module.exports = router;
