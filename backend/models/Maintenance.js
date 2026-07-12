const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"]
    },
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      enum: {
        values: [
          "Routine Service",
          "Oil Change",
          "Tire Service",
          "Brake Service",
          "Engine Repair",
          "Inspection",
          "Other"
        ],
        message: "Invalid service type"
      }
    },
    description: {
      type: String,
      trim: true
    },
    cost: {
      type: Number,
      required: [true, "Service cost is required"],
      min: [0, "Cost cannot be negative"]
    },
    date: {
      type: Date,
      required: [true, "Service date is required"]
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Completed"],
        message: "Invalid maintenance status"
      },
      default: "Active"
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
