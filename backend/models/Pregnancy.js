const mongoose = require("mongoose");

const pregnancySchema = new mongoose.Schema(
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

    dueDate: {
      type: Date,
    },

    currentWeek: {
      type: Number,
      default: 1,
    },

    currentDay: {
      type: Number,
      default: 0,
    },

    trimester: {
      type: String,
      enum: ["First", "Second", "Third"],
      default: "First",
    },

    isPregnant: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pregnancy", pregnancySchema);