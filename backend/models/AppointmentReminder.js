const mongoose = require("mongoose");

const appointmentReminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    doctorName: { type: String, required: true, trim: true },
    hospitalOrClinic: { type: String },
    reason: { type: String }, // e.g. "Routine checkup", "Ultrasound"
    appointmentDate: { type: Date, required: true },
    location: { type: String },
    remindBeforeMinutes: { type: Number, default: 60 }, // how long before to send the reminder
    status: {
      type: String,
      enum: ["upcoming", "completed", "missed", "cancelled"],
      default: "upcoming",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

appointmentReminderSchema.index({ userId: 1, appointmentDate: 1 });

module.exports = mongoose.model("AppointmentReminder", appointmentReminderSchema);
