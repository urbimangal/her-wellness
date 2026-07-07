const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  getComments,
  deleteComment,
  toggleLike,
  getLikeStatus,
  askExpert,
  getMyExpertQueries,
  getExpertQueries,
  answerExpertQuery,
} = require("../controllers/communityController");

// Posts — public read, auth required to write
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", protect, createPost);
router.put("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);

// Comments
router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", protect, addComment);
router.delete("/comments/:id", protect, deleteComment);

// Likes
router.post("/like", protect, toggleLike);
router.get("/like/status", protect, getLikeStatus);

// Ask Expert
router.post("/ask-expert", protect, askExpert);
router.get("/ask-expert/mine", protect, getMyExpertQueries);
router.get("/ask-expert", protect, getExpertQueries); // expert/admin view
router.put("/ask-expert/:id/answer", protect, answerExpertQuery);

module.exports = router;
