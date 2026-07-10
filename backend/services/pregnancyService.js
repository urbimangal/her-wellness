const Pregnancy = require("../models/Pregnancy");
const calculatePregnancy = require("../utils/pregnancyWeekCalculator");
const babyGrowthData = require("../utils/babyGrowthData");
const weeklyTips = require("../utils/weeklyTips");
const ApiError = require("../utils/ApiError");

/**
 * Refresh pregnancy calculations
 */
const refreshPregnancyData = async (pregnancy) => {
  const pregnancyData = calculatePregnancy(pregnancy.lastPeriodDate);

  pregnancy.currentWeek = pregnancyData.currentWeek;
  pregnancy.currentDay = pregnancyData.currentDay;
  pregnancy.trimester = pregnancyData.trimester;
  pregnancy.dueDate = pregnancyData.dueDate;

  await pregnancy.save();

  return pregnancy;
};

/**
 * Start Pregnancy
 */
exports.startPregnancy = async (userId, data) => {
  const existingPregnancy = await Pregnancy.findOne({
    user: userId,
    isPregnant: true,
  });

  if (existingPregnancy) {
    throw new ApiError(
      409,
      "An active pregnancy record already exists."
    );
  }

  if (new Date(data.lastPeriodDate) > new Date()) {
    throw new ApiError(
      400,
      "Last period date cannot be in the future."
    );
  }

  const pregnancyData = calculatePregnancy(data.lastPeriodDate);

  const pregnancy = await Pregnancy.create({
    user: userId,
    lastPeriodDate: data.lastPeriodDate,
    dueDate: pregnancyData.dueDate,
    currentWeek: pregnancyData.currentWeek,
    currentDay: pregnancyData.currentDay,
    trimester: pregnancyData.trimester,
    isPregnant: true,
  });

  return pregnancy;
};

/**
 * Get Current Week
 */
exports.getCurrentWeek = async (userId) => {
  const pregnancy = await Pregnancy.findOne({
    user: userId,
    isPregnant: true,
  });

  if (!pregnancy) {
    throw new ApiError(404, "Pregnancy record not found.");
  }

  return await refreshPregnancyData(pregnancy);
};

/**
 * Baby Growth
 */
exports.getBabyGrowth = async (userId) => {
  const pregnancy = await Pregnancy.findOne({
    user: userId,
    isPregnant: true,
  });

  if (!pregnancy) {
    throw new ApiError(404, "Pregnancy record not found.");
  }

  await refreshPregnancyData(pregnancy);

  return (
    babyGrowthData[pregnancy.currentWeek] || {
      week: pregnancy.currentWeek,
      message: "No baby growth information available.",
    }
  );
};

/**
 * Weekly Tips
 */
exports.getWeeklyTips = async (userId) => {
  const pregnancy = await Pregnancy.findOne({
    user: userId,
    isPregnant: true,
  });

  if (!pregnancy) {
    throw new ApiError(404, "Pregnancy record not found.");
  }

  await refreshPregnancyData(pregnancy);

  return (
    weeklyTips[pregnancy.currentWeek] || {
      week: pregnancy.currentWeek,
      tips: [],
    }
  );
};

/**
 * Pregnancy Calendar
 */
exports.getCalendar = async (userId) => {
  const pregnancy = await Pregnancy.findOne({
    user: userId,
    isPregnant: true,
  });

  if (!pregnancy) {
    throw new ApiError(404, "Pregnancy record not found.");
  }

  await refreshPregnancyData(pregnancy);

  return {
    lastPeriodDate: pregnancy.lastPeriodDate,
    dueDate: pregnancy.dueDate,
    currentWeek: pregnancy.currentWeek,
    currentDay: pregnancy.currentDay,
    trimester: pregnancy.trimester,
  };
};

/**
 * Update Pregnancy
 */
exports.updatePregnancy = async (pregnancyId, userId, data) => {
  const pregnancy = await Pregnancy.findOne({
    _id: pregnancyId,
    user: userId,
  });

  if (!pregnancy) {
    throw new ApiError(404, "Pregnancy record not found.");
  }

  if (data.lastPeriodDate) {
    if (new Date(data.lastPeriodDate) > new Date()) {
      throw new ApiError(
        400,
        "Last period date cannot be in the future."
      );
    }

    pregnancy.lastPeriodDate = data.lastPeriodDate;
  }

  return await refreshPregnancyData(pregnancy);
};

/**
 * Delete Pregnancy
 */
exports.deletePregnancy = async (pregnancyId, userId) => {
  const pregnancy = await Pregnancy.findOne({
    _id: pregnancyId,
    user: userId,
  });

  if (!pregnancy) {
    throw new ApiError(404, "Pregnancy record not found.");
  }

  await pregnancy.deleteOne();

  return {
    message: "Pregnancy record deleted successfully.",
  };
};