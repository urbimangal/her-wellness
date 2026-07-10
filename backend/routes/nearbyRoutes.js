const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getHospitals,
  addHospital,
  updateHospital,
  deleteHospital,
  getMedicalShops,
  addMedicalShop,
  updateMedicalShopStock,
  deleteMedicalShop,
  getHomeCareProviders,
  addHomeCareProvider,
  bookHomeCare,
  getMyHomeCareBookings,
  cancelHomeCareBooking,
  getBloodBanks,
  addBloodBank,
  updateBloodBankInventory,
} = require("../controllers/nearbyServicesController");

// Hospitals — public read (no login needed to view nearby hospitals in an emergency)
router.get("/hospitals", getHospitals);
router.post("/hospitals", protect, addHospital);
router.put("/hospitals/:id", protect, updateHospital);
router.delete("/hospitals/:id", protect, deleteHospital);

// Medical shops
router.get("/medical-shops", getMedicalShops);
router.post("/medical-shops", protect, addMedicalShop);
router.put("/medical-shops/:id/stock", protect, updateMedicalShopStock);
router.delete("/medical-shops/:id", protect, deleteMedicalShop);

// Home care (booking requires auth)
router.get("/home-care", getHomeCareProviders);
router.post("/home-care", protect, addHomeCareProvider);
router.post("/home-care/book", protect, bookHomeCare);
router.get("/home-care/bookings/mine", protect, getMyHomeCareBookings);
router.put("/home-care/bookings/:id/cancel", protect, cancelHomeCareBooking);

// Blood banks
router.get("/blood-banks", getBloodBanks);
router.post("/blood-banks", protect, addBloodBank);
router.put("/blood-banks/:id/inventory", protect, updateBloodBankInventory);

module.exports = router;
