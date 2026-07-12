const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const secret = process.env.JWT_SECRET || "fallback_secret_key";
      const decoded = jwt.verify(token, secret);

      // Get user from the token, exclude passwordHash
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authorized, user not found." });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ success: false, message: "Not authorized, token verification failed." });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided." });
  }
};

module.exports = { protect };
