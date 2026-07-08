const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  triggerSOS,
  resolveSOS,
  cancelSOS,
  getSOSHistory,
  addContact,
  getContacts,
  updateContact,
  deleteContact,
  updateLiveLocation,
  getLiveLocation,
  stopSharingLocation,
  getNearbyAmbulances,
  bookAmbulance,
} = require("../controllers/sosController");

// All SOS routes require an authenticated user
router.use(protect);

// SOS trigger / lifecycle
router.post("/trigger", triggerSOS);
router.put("/:id/resolve", resolveSOS);
router.put("/:id/cancel", cancelSOS);
router.get("/history", getSOSHistory);

// Emergency contacts CRUD
router.post("/contacts", addContact);
router.get("/contacts", getContacts);
router.put("/contacts/:id", updateContact);
router.delete("/contacts/:id", deleteContact);

// Live location
router.post("/location", updateLiveLocation);
router.get("/location", getLiveLocation);
router.put("/location/stop", stopSharingLocation);

// Ambulance (dummy data for now)
router.get("/ambulances/nearby", getNearbyAmbulances);
router.post("/ambulances/book", bookAmbulance);

module.exports = router;
