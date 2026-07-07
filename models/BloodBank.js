const mongoose = require("mongoose");

const bloodBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    phone: { type: String },
    // available units per blood group
    inventory: {
      "A+": { type: Number, default: 0 },
      "A-": { type: Number, default: 0 },
      "B+": { type: Number, default: 0 },
      "B-": { type: Number, default: 0 },
      "AB+": { type: Number, default: 0 },
      "AB-": { type: Number, default: 0 },
      "O+": { type: Number, default: 0 },
      "O-": { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

bloodBankSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model("BloodBank", bloodBankSchema);
