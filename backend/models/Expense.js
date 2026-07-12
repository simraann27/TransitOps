const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle"
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip"
    },
    category: {
      type: String,
      required: [true, "Expense category is required"],
      enum: {
        values: [
          "Toll",
          "Parking",
          "Permit",
          "Fine",
          "Insurance",
          "Cleaning",
          "Other"
        ],
        message: "Invalid expense category"
      }
    },
    description: {
      type: String,
      required: [true, "Expense description is required"],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0.01, "Amount must be greater than 0"]
    },
    date: {
      type: Date,
      required: [true, "Expense date is required"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
