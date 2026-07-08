const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["reminder", "alert", "insight", "community", "system", "sos"],
      default: "system",
    },
    channel: {
      type: String,
      enum: ["in-app", "email", "sms", "push"],
      default: "in-app",
    },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // deep link to relevant screen, e.g. /sos/history/123
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
