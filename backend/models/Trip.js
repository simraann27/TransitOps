const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tripCode: {
      type: String,
      required: [true, "Trip code is required"],
      unique: true,
      trim: true
    },
    origin: {
      type: String,
      required: [true, "Origin location is required"],
      trim: true
    },
    destination: {
      type: String,
      required: [true, "Destination location is required"],
      trim: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"]
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Driver reference is required"]
    },
    cargoWeight: {
      type: Number,
      required: [true, "Cargo weight is required"],
      min: [1, "Cargo weight must be greater than 0"]
    },
    plannedDistance: {
      type: Number,
      required: [true, "Planned distance is required"],
      min: [1, "Planned distance must be greater than 0"]
    },
    status: {
      type: String,
      enum: {
        values: ["Draft", "Dispatched", "On Trip", "Completed", "Cancelled"],
        message: "Invalid trip status"
      },
      default: "Draft"
    },
    dispatchedAt: {
      type: Date
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
