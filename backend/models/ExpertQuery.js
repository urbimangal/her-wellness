const mongoose = require("mongoose");

const expertQuerySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // assigned doctor/expert
    category: {
      type: String,
      enum: ["gynecology", "mental-health", "nutrition", "pregnancy", "general"],
      default: "general",
    },
    question: { type: String, required: true },
    answer: { type: String, default: null },
    status: { type: String, enum: ["pending", "answered", "closed"], default: "pending" },
    isAnonymous: { type: Boolean, default: false },
    answeredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExpertQuery", expertQuerySchema);
