const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true
    },
    licenseCategory: {
      type: String,
      required: [true, "License category is required"],
      enum: {
        values: ["LMV", "HMV", "HGMV", "Transport", "Other"],
        message: "Invalid license category"
      }
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, "License expiry date is required"]
    },
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true
    },
    tripCompletionPercentage: {
      type: Number,
      min: [0, "Trip completion percentage cannot be negative"],
      max: [100, "Trip completion percentage cannot exceed 100"],
      default: 100
    },
    safetyScore: {
      type: Number,
      min: [0, "Safety score cannot be negative"],
      max: [100, "Safety score cannot exceed 100"],
      default: 100
    },
    status: {
      type: String,
      enum: {
        values: ["Available", "On Trip", "Off Duty", "Suspended"],
        message: "Invalid status"
      },
      default: "Available"
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for eligibility checks
driverSchema.virtual("isEligible").get(function() {
  const currentDate = new Date();
  
  // Set current date to midnight for date-only comparison
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const expiry = new Date(this.licenseExpiryDate.getFullYear(), this.licenseExpiryDate.getMonth(), this.licenseExpiryDate.getDate());

  const isExpired = expiry < today;
  const isAvailable = this.status === "Available";

  return !isExpired && isAvailable;
});

module.exports = mongoose.model("Driver", driverSchema);
