const express = require("express");

const {
  createFuelRecord,
  getFuelRecords,
  getFuelRecordById,
  updateFuelRecord,
  deleteFuelRecord
} = require("../controllers/fuelController");

const router = express.Router();

router.route("/")
  .post(createFuelRecord)
  .get(getFuelRecords);

router.route("/:id")
  .get(getFuelRecordById)
  .put(updateFuelRecord)
  .delete(deleteFuelRecord);

module.exports = router;
