const express = require("express");

const {
  createMaintenance,
  getMaintenanceList,
  getMaintenanceById,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance
} = require("../controllers/maintenanceController");

const router = express.Router();

router.route("/")
  .post(createMaintenance)
  .get(getMaintenanceList);

router.route("/:id")
  .get(getMaintenanceById)
  .put(updateMaintenance)
  .delete(deleteMaintenance);

router.patch("/:id/complete", completeMaintenance);

module.exports = router;
