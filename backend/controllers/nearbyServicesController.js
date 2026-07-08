const Hospital = require("../models/Hospital");
const MedicalShop = require("../models/MedicalShop");
const BloodBank = require("../models/BloodBank");
const { HomeCare, HomeCareBooking } = require("../models/HomeCare");

// Haversine distance in km between two lat/lng points
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Generic helper: fetch all docs of a model, compute distance from
// query lat/lng, sort by distance, optionally filter by max radius (km)
const findNearby = async (Model, req, extraFilter = {}) => {
  const { lat, lng, radius } = req.query;
  const docs = await Model.find(extraFilter).lean();

  if (!lat || !lng) return docs; // no location given, return as-is

  const withDistance = docs
    .map((d) => ({ ...d, distanceKm: +getDistanceKm(+lat, +lng, d.lat, d.lng).toFixed(2) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (radius) return withDistance.filter((d) => d.distanceKm <= +radius);
  return withDistance;
};

/* -------------------------------- HOSPITALS -------------------------------- */

// @route GET /api/nearby/hospitals?lat=..&lng=..&radius=..
exports.getHospitals = async (req, res) => {
  try {
    const data = await findNearby(Hospital, req);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/nearby/hospitals  (admin/seed)
exports.addHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });
    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });
    res.status(200).json({ success: true, message: "Hospital deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------------ MEDICAL SHOPS ------------------------------ */

// @route GET /api/nearby/medical-shops?lat=..&lng=..&radius=..&medicine=paracetamol
exports.getMedicalShops = async (req, res) => {
  try {
    let data = await findNearby(MedicalShop, req);

    const { medicine } = req.query;
    if (medicine) {
      data = data
        .map((shop) => ({
          ...shop,
          matchedStock: shop.stock?.find((s) =>
            s.medicineName.toLowerCase().includes(medicine.toLowerCase())
          ),
        }))
        .filter((shop) => shop.matchedStock);
    }

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addMedicalShop = async (req, res) => {
  try {
    const shop = await MedicalShop.create(req.body);
    res.status(201).json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMedicalShopStock = async (req, res) => {
  try {
    // body: { stock: [{ medicineName, available, quantity }, ...] }
    const shop = await MedicalShop.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock },
      { new: true }
    );
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMedicalShop = async (req, res) => {
  try {
    const shop = await MedicalShop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.status(200).json({ success: true, message: "Shop deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------------------- HOME CARE -------------------------------- */

// @route GET /api/nearby/home-care?lat=..&lng=..&type=nurse
exports.getHomeCareProviders = async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.type) filter.type = req.query.type;
    const data = await findNearby(HomeCare, req, filter);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addHomeCareProvider = async (req, res) => {
  try {
    const provider = await HomeCare.create(req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/nearby/home-care/book
exports.bookHomeCare = async (req, res) => {
  try {
    const { homeCareId, startDate, endDate, notes } = req.body;

    const provider = await HomeCare.findById(homeCareId);
    if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

    const booking = await HomeCareBooking.create({
      userId: req.user.id,
      homeCareId,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({ success: true, message: "Home care booked", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/nearby/home-care/bookings/mine
exports.getMyHomeCareBookings = async (req, res) => {
  try {
    const bookings = await HomeCareBooking.find({ userId: req.user.id })
      .populate("homeCareId", "name type phone rating")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/nearby/home-care/bookings/:id/cancel
exports.cancelHomeCareBooking = async (req, res) => {
  try {
    const booking = await HomeCareBooking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "cancelled" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking cancelled", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------- BLOOD BANKS -------------------------------- */

// @route GET /api/nearby/blood-banks?lat=..&lng=..&group=O+
exports.getBloodBanks = async (req, res) => {
  try {
    let data = await findNearby(BloodBank, req);

    const { group } = req.query;
    if (group) {
      data = data.filter((bank) => bank.inventory && bank.inventory[group] > 0);
    }

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addBloodBank = async (req, res) => {
  try {
    const bank = await BloodBank.create(req.body);
    res.status(201).json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBloodBankInventory = async (req, res) => {
  try {
    // body: { inventory: { "O+": 10, "A-": 2, ... } }
    const bank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      { inventory: req.body.inventory },
      { new: true }
    );
    if (!bank) return res.status(404).json({ success: false, message: "Blood bank not found" });
    res.status(200).json({ success: true, data: bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
