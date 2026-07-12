const FuelRecord = require("../models/FuelRecord");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");

// Create Fuel Record
const createFuelRecord = async (req, res) => {
  try {
    const { vehicle: vehicleId, odometer, trip: tripId } = req.body;

    // 1. Fetch current Vehicle directly from MongoDB
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle does not exist."
      });
    }

    // 2. Validate odometer is not lower than the vehicle's current odometer
    if (odometer < vehicle.odometer) {
      return res.status(400).json({
        success: false,
        message: `Fuel odometer reading cannot be lower than the vehicle's current odometer of ${vehicle.odometer} km.`
      });
    }

    // 3. Verify Trip-Vehicle association if trip is selected
    if (tripId) {
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

    // 4. Update vehicle odometer if reading is higher
    if (odometer > vehicle.odometer) {
      vehicle.odometer = odometer;
      await vehicle.save();
    }

    // Create record
    const record = await FuelRecord.create(req.body);
    const populatedRecord = await FuelRecord.findById(record._id)
      .populate("vehicle")
      .populate("trip");

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

// Get all fuel records
const getFuelRecords = async (req, res) => {
  try {
    const records = await FuelRecord.find()
      .populate("vehicle")
      .populate("trip")
      .sort({ date: -1 });

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

// Get single fuel record
const getFuelRecordById = async (req, res) => {
  try {
    const record = await FuelRecord.findById(req.params.id)
      .populate("vehicle")
      .populate("trip");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Fuel record not found"
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

// Update fuel record
const updateFuelRecord = async (req, res) => {
  try {
    const { vehicle: vehicleId, odometer, trip: tripId } = req.body;

    const record = await FuelRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Fuel record not found"
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle does not exist."
      });
    }

    // Validate odometer reading (except we don't compare with the current record's own reading)
    // If the input odometer is lower than the current vehicle odometer, but we allow editing it down to vehicle.odometer
    if (odometer < vehicle.odometer && odometer < record.odometer) {
      return res.status(400).json({
        success: false,
        message: `Fuel odometer reading cannot be lower than the vehicle's current odometer of ${vehicle.odometer} km.`
      });
    }

    // Verify Trip-Vehicle association
    if (tripId) {
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

    // Update vehicle odometer if reading is higher
    if (odometer > vehicle.odometer) {
      vehicle.odometer = odometer;
      await vehicle.save();
    }

    const updatedRecord = await FuelRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("vehicle").populate("trip");

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

// Delete fuel record
const deleteFuelRecord = async (req, res) => {
  try {
    const record = await FuelRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Fuel record not found"
      });
    }

    await FuelRecord.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Fuel record deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createFuelRecord,
  getFuelRecords,
  getFuelRecordById,
  updateFuelRecord,
  deleteFuelRecord
};
