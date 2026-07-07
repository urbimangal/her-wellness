const mongoose = require("mongoose");

const medicalShopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    phone: { type: String },
    isOpen24x7: { type: Boolean, default: false },
    homeDelivery: { type: Boolean, default: false },
    // simple stock check: medicine name -> boolean/quantity
    stock: [
      {
        medicineName: { type: String, required: true },
        available: { type: Boolean, default: true },
        quantity: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

medicalShopSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model("MedicalShop", medicalShopSchema);
