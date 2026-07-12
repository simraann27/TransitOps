const express = require("express");

const {
  createDriver,
  getDrivers,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverController");

const router = express.Router();

router.route("/")
  .post(createDriver)
  .get(getDrivers);

router.route("/:id")
  .put(updateDriver)
  .delete(deleteDriver);

module.exports = router;
