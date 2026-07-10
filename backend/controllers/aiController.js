const asyncHandler = require("../utils/asyncHandler");

const aiChatService = require("../services/aiChatService");
const symptomService = require("../services/symptomService");
const riskPredictionService = require("../services/riskPredictionService");

/**
 * @route POST /api/ai/chat
 * @desc AI Health Assistant Chat
 * @access Public
 */
const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Message is required.",
    });
  }

  const reply = await aiChatService(message);

  res.status(200).json({
    success: true,
    reply,
  });
});

/**
 * @route POST /api/ai/symptom-check
 * @desc Symptom Checker (ML Integration Pending)
 * @access Public
 */
const symptomChecker = asyncHandler(async (req, res) => {
  const result = await symptomService(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @route POST /api/ai/recommendations
 * @desc AI Health Recommendations
 * @access Public
 */
const recommendations = asyncHandler(async (req, res) => {
  const { disease } = req.body;

  if (!disease || !disease.trim()) {
    return res.status(400).json({
      success: false,
      message: "Disease is required.",
    });
  }

  const result = await recommendationService(disease);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @route POST /api/ai/risk-prediction
 * @desc Lifestyle Disease Risk Prediction (ML Integration Pending)
 * @access Public
 */
const riskPrediction = asyncHandler(async (req, res) => {
  const result = await riskPredictionService(req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  chat,
  symptomChecker,
  recommendations,
  riskPrediction,
};