const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "mental-health", "pregnancy", "fitness", "success-story", "question"],
      default: "general",
    },
    image: { type: String }, // URL
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
