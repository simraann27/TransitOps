const Driver = require("../models/Driver");

// Create driver
const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      driver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
};
