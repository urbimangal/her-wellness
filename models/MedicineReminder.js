const mongoose = require("mongoose");

const medicineReminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String }, // e.g. "1 tablet", "5ml"
    frequency: {
      type: String,
      enum: ["once", "daily", "twice_daily", "thrice_daily", "weekly", "custom"],
      default: "daily",
    },
    times: [{ type: String, required: true }], // e.g. ["08:00", "20:00"] (24h format)
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date }, // optional, null = ongoing
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    // tracks which doses have been marked "taken" (dedupes by date+time)
    logs: [
      {
        date: { type: Date, required: true },
        time: { type: String, required: true },
        taken: { type: Boolean, default: false },
        takenAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

medicineReminderSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("MedicineReminder", medicineReminderSchema);
