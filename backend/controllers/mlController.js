const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const {
  predictPeriod,
  getRecommendations,
} = require("../services/mlService");

const predict = asyncHandler(async (req, res) => {
  const result = await predictPeriod(req.body);

  res.status(200).json({
    success: true,
    message: "Prediction generated successfully",
    data: result,
  });
});

const recommend = asyncHandler(async (req, res) => {
  const result = await getRecommendations(req.body);

  res.status(200).json({
    success: true,
    message: "Recommendations generated successfully",
    data: result,
  });
});

module.exports = {
  predict,
  recommend,
};