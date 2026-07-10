const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Post" },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    text: { type: String, required: true },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // for replies
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
