const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token helper
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "fallback_secret_key";
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Full Name is required." });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    // Check if user exists
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email address." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user. Force role to "Dispatcher" as required for public signup
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "Dispatcher", // ignore any role sent from frontend for now
    });

    if (user) {
      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid user data provided." });
    }
  } catch (error) {
    console.error("Register user error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }

    // Find user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login user error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// @desc    Authenticate user with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential token is required." });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId || googleClientId.trim() === "") {
      return res.status(500).json({ 
        success: false, 
        message: "Google Sign-In is not fully configured on the server. GOOGLE_CLIENT_ID is missing." 
      });
    }

    let payload;
    try {
      const { OAuth2Client } = require("google-auth-library");
      const oauthClient = new OAuth2Client(googleClientId);
      const ticket = await oauthClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error("Google ID token verification failed:", verifyError);
      return res.status(401).json({ success: false, message: "Invalid Google credential token." });
    }

    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: "Google account does not provide an email address." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Search User by verified email
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create user
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        authProvider: "google",
        role: "Dispatcher" // default role for new signups
      });
    } else {
      // User exists. Do not overwrite their existing role.
      if (user.authProvider !== "google") {
        user.authProvider = "google";
        await user.save();
      }
    }

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleLogin
};
