const mongoose = require("mongoose");

const healthScoreSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    date: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 100, required: true },
    // breakdown factors that feed into the overall score
    factors: {
      sleepScore: { type: Number, min: 0, max: 100, default: 0 },
      activityScore: { type: Number, min: 0, max: 100, default: 0 },
      moodScore: { type: Number, min: 0, max: 100, default: 0 },
      hydrationScore: { type: Number, min: 0, max: 100, default: 0 },
      cycleRegularityScore: { type: Number, min: 0, max: 100, default: 0 },
    },
  },
  { timestamps: true }
);

healthScoreSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("HealthScore", healthScoreSchema);
