const User = require("../models/user.js");

async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  } catch (error) {
    console.error("Admin check failed:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = adminMiddleware;
