const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "resolved", "cancelled"],
      default: "active",
    },
    notifiedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "EmergencyContact" }],
    policeAlerted: { type: Boolean, default: false },
    ambulanceRequested: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SOSAlert", sosAlertSchema);
