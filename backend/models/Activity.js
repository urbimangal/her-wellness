const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    type: {
      type: String,
      enum: [
        "steps",
        "water_intake",
        "workout",
        "mood_log",
        "cycle_log",
        "medicine_taken",
        "doctor_appointment",
        "sos_triggered",
        "community_post",
      ],
      required: true,
    },
    description: { type: String, required: true }, // e.g. "Logged 4,236 steps"
    value: { type: mongoose.Schema.Types.Mixed }, // flexible: number, object, etc.
    icon: { type: String }, // icon key for frontend, e.g. "footprint", "water-glass"
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
