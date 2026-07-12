const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

// Create Active Maintenance
const createMaintenance = async (req, res) => {
  try {
    const { vehicle: vehicleId } = req.body;
    
    // Re-fetch Vehicle directly from database
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Assigned vehicle does not exist."
      });
    }

    // Vehicle status validations
    if (vehicle.status === "On Trip") {
      return res.status(400).json({
        success: false,
        message: "Vehicle currently on trip cannot enter maintenance."
      });
    }
    if (vehicle.status === "Retired") {
      return res.status(400).json({
        success: false,
        message: "Retired vehicle cannot enter maintenance."
      });
    }

    // Validate if the vehicle already has an Active maintenance record
    const existingActive = await Maintenance.findOne({
      vehicle: vehicleId,
      status: "Active"
    });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: "Vehicle already has an active maintenance record."
      });
    }

    // Update vehicle status
    vehicle.status = "In Shop";
    await vehicle.save();

    // Create record
    const record = await Maintenance.create({
      ...req.body,
      status: "Active"
    });

    const populatedRecord = await Maintenance.findById(record._id)
      .populate("vehicle");

    res.status(201).json({
      success: true,
      record: populatedRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all maintenance list
const getMaintenanceList = async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate("vehicle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single maintenance record
const getMaintenanceById = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id)
      .populate("vehicle");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }

    res.status(200).json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update active maintenance
const updateMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }

    if (record.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Completed maintenance records cannot be modified."
      });
    }

    const updatedRecord = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("vehicle");

    res.status(200).json({
      success: true,
      record: updatedRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Complete service transition
const completeMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }

    if (record.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Service record is already completed."
      });
    }

    const vehicle = await Vehicle.findById(record.vehicle);
    if (vehicle && vehicle.status !== "Retired") {
      vehicle.status = "Available";
      await vehicle.save();
    }

    record.status = "Completed";
    record.completedAt = new Date();
    await record.save();

    const populatedRecord = await Maintenance.findById(record._id)
      .populate("vehicle");

    res.status(200).json({
      success: true,
      record: populatedRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete maintenance record
const deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }

    if (record.status === "Active") {
      return res.status(400).json({
        success: false,
        message: "Active maintenance must be completed before deletion."
      });
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createMaintenance,
  getMaintenanceList,
  getMaintenanceById,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance
};
