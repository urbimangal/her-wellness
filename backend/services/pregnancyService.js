const Pregnancy = require("../models/Pregnancy");
const calculatePregnancy = require("../utils/pregnancyWeekCalculator");
const babyGrowthData = require("../utils/babyGrowthData");
const weeklyTips = require("../utils/weeklyTips");
// Start Pregnancy
exports.startPregnancy = async (userId, data) => {
    // Check if user already has an active pregnancy record
    const existingPregnancy = await Pregnancy.findOne({
        user: userId,
        isPregnant: true,
    });

    if (existingPregnancy) {
        throw new Error("An active pregnancy record already exists.");
    }
    const pregnancyData = calculatePregnancy(
        data.lastPeriodDate
    );

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

// Get Current Week
exports.getCurrentWeek = async (userId) => {

    const pregnancy = await Pregnancy.findOne({

        user: userId,

        isPregnant: true,

    });

    if (!pregnancy) {

        throw new Error("Pregnancy record not found.");

    }

    const pregnancyData = calculatePregnancy(
        pregnancy.lastPeriodDate
    );

    pregnancy.currentWeek = pregnancyData.currentWeek;

    pregnancy.currentDay = pregnancyData.currentDay;

    pregnancy.trimester = pregnancyData.trimester;

    pregnancy.dueDate = pregnancyData.dueDate;

    await pregnancy.save();

    return pregnancy;

};

// Baby Growth
exports.getBabyGrowth = async (userId) => {

    const pregnancy = await Pregnancy.findOne({
        user: userId,
        isPregnant: true,
    });

    if (!pregnancy) {
        throw new Error("Pregnancy record not found.");
    }

    return babyGrowthData[pregnancy.currentWeek];

};

// Weekly Tips
exports.getWeeklyTips = async (userId) => {

    const pregnancy = await Pregnancy.findOne({
        user: userId,
        isPregnant: true,
    });

    if (!pregnancy) {
        throw new Error("Pregnancy record not found.");
    }

    return weeklyTips[pregnancy.currentWeek];

};


// Pregnancy Calendar
exports.getCalendar = async (userId) => {

    const pregnancy = await Pregnancy.findOne({

        user: userId,

        isPregnant: true,

    });

    if (!pregnancy) {

        throw new Error("Pregnancy record not found.");

    }

    return {

        currentWeek: pregnancy.currentWeek,

        currentDay: pregnancy.currentDay,

        trimester: pregnancy.trimester,

        dueDate: pregnancy.dueDate,

    };

};

// Update Pregnancy
exports.updatePregnancy = async (
    pregnancyId,
    userId,
    data
) => {

    const pregnancy = await Pregnancy.findOne({

        _id: pregnancyId,

        user: userId,

    });

    if (!pregnancy) {

        throw new Error("Pregnancy record not found.");

    }

    if (data.lastPeriodDate) {

        pregnancy.lastPeriodDate = data.lastPeriodDate;

        const pregnancyData = calculatePregnancy(
            data.lastPeriodDate
        );

        pregnancy.currentWeek = pregnancyData.currentWeek;

        pregnancy.currentDay = pregnancyData.currentDay;

        pregnancy.trimester = pregnancyData.trimester;

        pregnancy.dueDate = pregnancyData.dueDate;

    }

    await pregnancy.save();

    return pregnancy;

};

// Delete Pregnancy
exports.deletePregnancy = async (
    pregnancyId,
    userId
) => {

    const pregnancy = await Pregnancy.findOne({

        _id: pregnancyId,

        user: userId,

    });

    if (!pregnancy) {

        throw new Error("Pregnancy record not found.");

    }

    await Pregnancy.findByIdAndDelete(
        pregnancyId
    );

    return true;

};