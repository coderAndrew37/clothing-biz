const jwt = require("jsonwebtoken");

// Use environment variables or provide fallback secrets
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * Middleware to verify if the user is authenticated.
 * Validates the access token from cookies.
 */
function authMiddleware(req, res, next) {
  const token = req.cookies.access_token;
  console.log("authMiddleware: Received Token:", token); // Debug log

  if (!token) {
    console.log("authMiddleware: Token is missing"); // Debug log
    return res.status(401).json({ message: "Unauthorized. Token is missing." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log("authMiddleware: Decoded Token:", decoded); // Debug log
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error("authMiddleware: Token verification failed:", error.message); // Debug log
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }
    res.status(403).json({ message: "Invalid token. Access denied." });
  }
}

module.exports = authMiddleware;
