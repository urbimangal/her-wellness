const SOSAlert = require("../models/SOSAlert");
const EmergencyContact = require("../models/EmergencyContact");
const LiveLocation = require("../models/LiveLocation");

/* ---------------------------- SOS TRIGGER ---------------------------- */

// @route  POST /api/sos/trigger
// @desc   Trigger an SOS alert with current location
exports.triggerSOS = async (req, res) => {
  try {
    const { lat, lng, address, ambulanceRequested, policeAlerted } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    // Grab all emergency contacts for this user so they get "notified"
    const contacts = await EmergencyContact.find({ userId: req.user.id });

    const sos = await SOSAlert.create({
      userId: req.user.id,
      location: { lat, lng, address },
      notifiedContacts: contacts.map((c) => c._id),
      ambulanceRequested: !!ambulanceRequested,
      policeAlerted: !!policeAlerted,
    });

    // TODO: hook this up to actual SMS/Email/Push notification service
    // e.g. notifyContacts(contacts, sos)

    return res.status(201).json({
      success: true,
      message: "SOS triggered successfully. Contacts notified.",
      data: sos,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/sos/:id/resolve
exports.resolveSOS = async (req, res) => {
  try {
    const sos = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "resolved", resolvedAt: new Date() },
      { new: true }
    );

    if (!sos) return res.status(404).json({ success: false, message: "SOS alert not found" });

    return res.status(200).json({ success: true, message: "SOS marked resolved", data: sos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/sos/:id/cancel
exports.cancelSOS = async (req, res) => {
  try {
    const sos = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "cancelled" },
      { new: true }
    );

    if (!sos) return res.status(404).json({ success: false, message: "SOS alert not found" });

    return res.status(200).json({ success: true, message: "SOS cancelled", data: sos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/sos/history
exports.getSOSHistory = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------ EMERGENCY CONTACTS CRUD ------------------------ */

// @route  POST /api/sos/contacts
exports.addContact = async (req, res) => {
  try {
    const { name, relation, phone, email, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "name and phone are required" });
    }

    const contact = await EmergencyContact.create({
      userId: req.user.id,
      name,
      relation,
      phone,
      email,
      isPrimary,
    });

    return res.status(201).json({ success: true, message: "Contact added", data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/sos/contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user.id }).sort({ isPrimary: -1 });
    return res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/sos/contacts/:id
exports.updateContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

    return res.status(200).json({ success: true, message: "Contact updated", data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/sos/contacts/:id
exports.deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

    return res.status(200).json({ success: true, message: "Contact deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------------- LIVE LOCATION --------------------------- */

// @route  POST /api/sos/location
// @desc   Create/update the user's live location (called every few seconds/minutes by the app)
exports.updateLiveLocation = async (req, res) => {
  try {
    const { lat, lng, isSharing } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const location = await LiveLocation.findOneAndUpdate(
      { userId: req.user.id },
      { lat, lng, isSharing, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, message: "Location updated", data: location });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/sos/location
exports.getLiveLocation = async (req, res) => {
  try {
    const location = await LiveLocation.findOne({ userId: req.user.id });
    if (!location) return res.status(404).json({ success: false, message: "No location found" });
    return res.status(200).json({ success: true, data: location });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/sos/location/stop
// @desc   Stop sharing live location
exports.stopSharingLocation = async (req, res) => {
  try {
    const location = await LiveLocation.findOneAndUpdate(
      { userId: req.user.id },
      { isSharing: false },
      { new: true }
    );
    return res.status(200).json({ success: true, message: "Live location sharing stopped", data: location });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------- AMBULANCE / HOSPITAL (DUMMY) --------------------- */
// NOTE: No public free ambulance-booking API exists in most regions, so this
// returns realistic dummy data. Swap this out for a real provider/DB later.

const dummyAmbulances = [
  { id: "amb_1", driverName: "Ramesh Kumar", vehicleNo: "UK07 AB 1234", eta: "6 min", distanceKm: 2.1, contact: "+91-9000000001" },
  { id: "amb_2", driverName: "Suresh Singh", vehicleNo: "UK07 CD 5678", eta: "9 min", distanceKm: 3.4, contact: "+91-9000000002" },
  { id: "amb_3", driverName: "City Ambulance Service", vehicleNo: "UK07 EF 9012", eta: "12 min", distanceKm: 5.0, contact: "+91-9000000003" },
];

// @route  GET /api/sos/ambulances/nearby
exports.getNearbyAmbulances = async (req, res) => {
  try {
    // In production: query real providers or a DB collection using lat/lng from req.query
    return res.status(200).json({ success: true, count: dummyAmbulances.length, data: dummyAmbulances });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/sos/ambulances/book
exports.bookAmbulance = async (req, res) => {
  try {
    const { ambulanceId, sosAlertId } = req.body;

    const ambulance = dummyAmbulances.find((a) => a.id === ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ success: false, message: "Ambulance not found" });
    }

    if (sosAlertId) {
      await SOSAlert.findByIdAndUpdate(sosAlertId, { ambulanceRequested: true });
    }

    return res.status(200).json({
      success: true,
      message: `Ambulance booked. ${ambulance.driverName} is on the way.`,
      data: ambulance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
