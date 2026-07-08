const mongoose = require("mongoose");

const menstrualCycleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastPeriodDate: {
      type: Date,
      required: true,
    },

    cycleLength: {
      type: Number,
      default: 28,
      min: 20,
      max: 45,
    },

    periodLength: {
      type: Number,
      default: 5,
      min: 2,
      max: 10,
    },

    flow: {
      type: String,
      enum: ["Light", "Medium", "Heavy"],
      default: "Medium",
    },

    symptoms: {
      type: [String],
      default: [],
    },

    mood: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    predictedNextPeriod: Date,

    ovulationDate: Date,

    fertileWindowStart: Date,

    fertileWindowEnd: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MenstrualCycle",
  menstrualCycleSchema
);