const mongoose = require("mongoose");

const liveLocationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", unique: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isSharing: { type: Boolean, default: false }, // toggled on when user shares live location
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveLocation", liveLocationSchema);
