const Expense = require("../models/Expense");
const Trip = require("../models/Trip");

// Create General Expense
const createExpense = async (req, res) => {
  try {
    const { vehicle: vehicleId, trip: tripId } = req.body;

    // Verify Trip-Vehicle association if both are selected
    if (vehicleId && tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(400).json({
          success: false,
          message: "Selected trip does not exist."
        });
      }

      const tripVehicleId = trip.vehicle?._id || trip.vehicle;
      if (tripVehicleId.toString() !== vehicleId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Selected trip is assigned to a different vehicle."
        });
      }
    }

    // Create record
    const expense = await Expense.create(req.body);
    const populatedExpense = await Expense.findById(expense._id)
      .populate("vehicle")
      .populate("trip");

    res.status(201).json({
      success: true,
      expense: populatedExpense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("vehicle")
      .populate("trip")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single expense
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("vehicle")
      .populate("trip");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense record not found"
      });
    }

    res.status(200).json({
      success: true,
      expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update expense record
const updateExpense = async (req, res) => {
  try {
    const { vehicle: vehicleId, trip: tripId } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense record not found"
      });
    }

    // Verify Trip-Vehicle association
    if (vehicleId && tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(400).json({
          success: false,
          message: "Selected trip does not exist."
        });
      }

      const tripVehicleId = trip.vehicle?._id || trip.vehicle;
      if (tripVehicleId.toString() !== vehicleId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Selected trip is assigned to a different vehicle."
        });
      }
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("vehicle").populate("trip");

    res.status(200).json({
      success: true,
      expense: updatedExpense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense record not found"
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};
