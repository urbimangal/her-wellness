const express = require("express");

const {
  chat,
  symptomChecker,
  recommendations,
  riskPrediction,
} = require("../controllers/aiController");

const router = express.Router();

/**
 * AI Chatbot
 */
router.post("/chat", chat);

/**
 * Symptom Checker
 */
router.post("/symptom-check", symptomChecker);

/**
 * AI Health Recommendations
 */
router.post("/recommendations", recommendations);

/**
 * Lifestyle Disease Risk Prediction
 */
router.post("/risk-prediction", riskPrediction);

module.exports = router;