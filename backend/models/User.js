const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"],
      default: "Dispatcher",
    },
    authProvider: {
      type: String,
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
