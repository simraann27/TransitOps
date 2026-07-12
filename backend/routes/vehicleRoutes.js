const express = require("express");

const {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

const router = express.Router();

router.route("/")
  .post(createVehicle)
  .get(getVehicles);

router.route("/:id")
  .put(updateVehicle)
  .delete(deleteVehicle);

module.exports = router;