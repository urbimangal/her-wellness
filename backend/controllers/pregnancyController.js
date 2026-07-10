const pregnancyService = require("../services/pregnancyService");
const validatePregnancy = require("../validators/pregnancyValidator");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Start Pregnancy
exports.startPregnancy = asyncHandler(async (req, res) => {
  const errors = validatePregnancy(req.body);

  if (errors.length) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const pregnancy = await pregnancyService.startPregnancy(
    req.user._id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Pregnancy record created successfully.",
    data: pregnancy,
  });
});

// Current Week
exports.getCurrentWeek = asyncHandler(async (req, res) => {
  const pregnancy = await pregnancyService.getCurrentWeek(req.user._id);

  res.status(200).json({
    success: true,
    data: pregnancy,
  });
});

// Baby Growth
exports.getBabyGrowth = asyncHandler(async (req, res) => {
  const growth = await pregnancyService.getBabyGrowth(req.user._id);

  res.status(200).json({
    success: true,
    data: growth,
  });
});

// Weekly Tips
exports.getWeeklyTips = asyncHandler(async (req, res) => {
  const tips = await pregnancyService.getWeeklyTips(req.user._id);

  res.status(200).json({
    success: true,
    data: tips,
  });
});

// Pregnancy Calendar
exports.getCalendar = asyncHandler(async (req, res) => {
  const calendar = await pregnancyService.getCalendar(req.user._id);

  res.status(200).json({
    success: true,
    data: calendar,
  });
});

// Update Pregnancy
exports.updatePregnancy = asyncHandler(async (req, res) => {
  const pregnancy = await pregnancyService.updatePregnancy(
    req.params.id,
    req.user._id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Pregnancy updated successfully.",
    data: pregnancy,
  });
});

// Delete Pregnancy
exports.deletePregnancy = asyncHandler(async (req, res) => {
  await pregnancyService.deletePregnancy(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Pregnancy record deleted successfully.",
  });
});