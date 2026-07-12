const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  dispatchTrip,
  startTrip,
  completeTrip,
  cancelTrip,
} = require("../controllers/tripController");

const router = express.Router();

router.route("/")
  .post(createTrip)
  .get(getTrips);

router.route("/:id")
  .get(getTripById)
  .put(updateTrip);

router.patch("/:id/dispatch", dispatchTrip);
router.patch("/:id/start", startTrip);
router.patch("/:id/complete", completeTrip);
router.patch("/:id/cancel", cancelTrip);

module.exports = router;
