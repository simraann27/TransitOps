const mongoose = require("mongoose");

const fuelRecordSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"]
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip"
    },
    date: {
      type: Date,
      required: [true, "Fuel record date is required"]
    },
    liters: {
      type: Number,
      required: [true, "Liters is required"],
      min: [0.01, "Liters must be greater than 0"]
    },
    cost: {
      type: Number,
      required: [true, "Total fuel cost is required"],
      min: [0.01, "Fuel cost must be greater than 0"]
    },
    odometer: {
      type: Number,
      required: [true, "Odometer reading is required"],
      min: [0, "Odometer reading cannot be negative"]
    },
    fuelStation: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FuelRecord", fuelRecordSchema);
