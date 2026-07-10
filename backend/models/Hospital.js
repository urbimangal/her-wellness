const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    phone: { type: String },
    specialities: [{ type: String }], // e.g. Gynecology, Maternity, General
    rating: { type: Number, min: 0, max: 5, default: 0 },
    isOpen24x7: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hospitalSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model("Hospital", hospitalSchema);
