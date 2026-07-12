const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");

// Create trip as Draft
const createTrip = async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    
    // Populate details before responding
    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(201).json({
      success: true,
      trip: populatedTrip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all trips
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("vehicle")
      .populate("driver")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      trips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single trip
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("vehicle")
      .populate("driver");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Draft trip
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only Draft trips can be modified.",
      });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("vehicle").populate("driver");

    res.status(200).json({
      success: true,
      trip: updatedTrip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Dispatch Trip PATCH validation checks
const dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only Draft trips can be dispatched.",
      });
    }

    // Re-fetch Vehicle directly from database
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Assigned vehicle does not exist.",
      });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "Selected vehicle is not available for dispatch.",
      });
    }

    // Re-fetch Driver directly from database
    const driver = await Driver.findById(trip.driver);
    if (!driver) {
      return res.status(400).json({
        success: false,
        message: "Assigned driver does not exist.",
      });
    }

    // Driver availability validations
    if (driver.status === "Suspended") {
      return res.status(400).json({
        success: false,
        message: "Selected driver is suspended and cannot be dispatched.",
      });
    }
    if (driver.status === "On Trip") {
      return res.status(400).json({
        success: false,
        message: "Selected driver is already assigned to an active trip.",
      });
    }
    if (driver.status === "Off Duty") {
      return res.status(400).json({
        success: false,
        message: "Selected driver is currently off duty.",
      });
    }

    // License expiry check against current date (midnight comparison)
    const currentDate = new Date();
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const expiry = new Date(driver.licenseExpiryDate.getFullYear(), driver.licenseExpiryDate.getMonth(), driver.licenseExpiryDate.getDate());
    
    if (expiry < today) {
      return res.status(400).json({
        success: false,
        message: "Driver license has expired. Select an eligible driver.",
      });
    }

    // Cargo weight vs max capacity validation checks
    if (trip.cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight exceeds vehicle maximum load capacity of ${vehicle.maxLoadCapacity} kg.`,
      });
    }

    // Save driver & vehicle statuses first. If either fails, trip is not updated.
    driver.status = "On Trip";
    vehicle.status = "On Trip";

    await driver.save();
    await vehicle.save();

    // Update trip details
    trip.status = "Dispatched";
    trip.dispatchedAt = new Date();
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(200).json({
      success: true,
      trip: populatedTrip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Start Trip PATCH
const startTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "Dispatched") {
      return res.status(400).json({
        success: false,
        message: "Trip must be dispatched before it can be started.",
      });
    }

    trip.status = "On Trip";
    trip.startedAt = new Date();
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(200).json({
      success: true,
      trip: populatedTrip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete Trip PATCH
const completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status !== "On Trip") {
      return res.status(400).json({
        success: false,
        message: "Only active trips (On Trip) can be completed.",
      });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    if (vehicle) {
      vehicle.status = "Available";
      await vehicle.save();
    }
    if (driver) {
      driver.status = "Available";
      await driver.save();
    }

    trip.status = "Completed";
    trip.completedAt = new Date();
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(200).json({
      success: true,
      trip: populatedTrip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel Trip PATCH
const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed trips cannot be cancelled.",
      });
    }

    if (trip.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Trip is already cancelled.",
      });
    }

    // Return vehicle & driver to Available if current status was Dispatched/On Trip
    if (trip.status === "Dispatched" || trip.status === "On Trip") {
      const vehicle = await Vehicle.findById(trip.vehicle);
      const driver = await Driver.findById(trip.driver);

      if (vehicle && vehicle.status !== "Retired") {
        vehicle.status = "Available";
        await vehicle.save();
      }
      if (driver && driver.status !== "Suspended") {
        driver.status = "Available";
        await driver.save();
      }
    }

    trip.status = "Cancelled";
    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("vehicle")
      .populate("driver");

    res.status(200).json({
      success: true,
      trip: populatedTrip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  startTrip,
  completeTrip,
  cancelTrip,
};
