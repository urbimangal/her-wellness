const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const ExpertQuery = require("../models/ExpertQuery");

/* ---------------------------------- POSTS ---------------------------------- */

// @route POST /api/community/posts
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, image, isAnonymous } = req.body;

    if (!content) return res.status(400).json({ success: false, message: "content is required" });

    const post = await Post.create({
      userId: req.user.id,
      title,
      content,
      category,
      image,
      isAnonymous,
    });

    res.status(201).json({ success: true, message: "Post created", data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/community/posts?category=&page=&limit=
exports.getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = category ? { category } : {};

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(+limit);

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: +page,
      totalPages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/community/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/community/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ success: false, message: "Post not found or not yours" });
    res.status(200).json({ success: true, message: "Post updated", data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/community/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!post) return res.status(404).json({ success: false, message: "Post not found or not yours" });

    // Clean up related comments and likes
    await Comment.deleteMany({ postId: post._id });
    await Like.deleteMany({ targetType: "Post", targetId: post._id });

    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------------------- COMMENTS --------------------------------- */

// @route POST /api/community/posts/:postId/comments
exports.addComment = async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    const { postId } = req.params;

    if (!text) return res.status(400).json({ success: false, message: "text is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      text,
      parentCommentId: parentCommentId || null,
    });

    post.commentsCount += 1;
    await post.save();

    res.status(201).json({ success: true, message: "Comment added", data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/community/posts/:postId/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/community/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found or not yours" });

    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------------------------- LIKES ---------------------------------- */

// @route POST /api/community/like
// body: { targetType: "Post" | "Comment", targetId }
exports.toggleLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;

    if (!["Post", "Comment"].includes(targetType)) {
      return res.status(400).json({ success: false, message: "targetType must be Post or Comment" });
    }

    const existing = await Like.findOne({ userId: req.user.id, targetType, targetId });
    const Model = targetType === "Post" ? Post : Comment;

    if (existing) {
      // Unlike
      await existing.deleteOne();
      if (targetType === "Post") {
        await Model.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
      }
      return res.status(200).json({ success: true, message: "Like removed", liked: false });
    }

    // Like
    await Like.create({ userId: req.user.id, targetType, targetId });
    if (targetType === "Post") {
      await Model.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });
    }

    res.status(201).json({ success: true, message: "Liked", liked: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/community/like/status?targetType=Post&targetId=...
exports.getLikeStatus = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const liked = await Like.exists({ userId: req.user.id, targetType, targetId });
    res.status(200).json({ success: true, liked: !!liked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------- ASK EXPERT -------------------------------- */

// @route POST /api/community/ask-expert
exports.askExpert = async (req, res) => {
  try {
    const { question, category, isAnonymous } = req.body;
    if (!question) return res.status(400).json({ success: false, message: "question is required" });

    const query = await ExpertQuery.create({
      userId: req.user.id,
      question,
      category,
      isAnonymous,
    });

    res.status(201).json({ success: true, message: "Question submitted to experts", data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/community/ask-expert/mine
exports.getMyExpertQueries = async (req, res) => {
  try {
    const queries = await ExpertQuery.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: queries.length, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/community/ask-expert?status=pending  (for expert/doctor dashboard)
exports.getExpertQueries = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const queries = await ExpertQuery.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: queries.length, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/community/ask-expert/:id/answer  (expert answering)
exports.answerExpertQuery = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ success: false, message: "answer is required" });

    const query = await ExpertQuery.findByIdAndUpdate(
      req.params.id,
      { answer, status: "answered", expertId: req.user.id, answeredAt: new Date() },
      { new: true }
    );

    if (!query) return res.status(404).json({ success: false, message: "Query not found" });

    res.status(200).json({ success: true, message: "Answer submitted", data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
