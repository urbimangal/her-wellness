const mongoose = require("mongoose");

const homeCareSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // caretaker/nurse name
    type: { type: String, enum: ["nurse", "caretaker", "physiotherapist", "attendant"], default: "nurse" },
    experienceYears: { type: Number, default: 0 },
    phone: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    pricePerDay: { type: Number },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

const homeCareBookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    homeCareId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "HomeCare" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  HomeCare: mongoose.model("HomeCare", homeCareSchema),
  HomeCareBooking: mongoose.model("HomeCareBooking", homeCareBookingSchema),
};
