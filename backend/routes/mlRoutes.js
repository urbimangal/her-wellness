const express = require("express");

const router = express.Router();

const {
  predict,
  recommend,
} = require("../controllers/mlController");

const protect = require("../middleware/authMiddleware");

// Protected ML Routes
router.post("/predict", protect, predict);

router.post("/recommend", protect, recommend);

module.exports = router;