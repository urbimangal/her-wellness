const pregnancyService = require("../services/pregnancyService");
const validatePregnancy = require("../validators/pregnancyValidator");

const TEST_USER_ID = "6a4ce83255fc73284bbbfc5b";

// Start Pregnancy
exports.startPregnancy = async (req, res) => {

    try {

        const errors = validatePregnancy(req.body);

        if (errors.length) {

            return res.status(400).json({

                success: false,

                errors,

            });

        }

        const pregnancy = await pregnancyService.startPregnancy(

            TEST_USER_ID,
            req.body

        );

        res.status(201).json({

            success: true,

            message: "Pregnancy record created successfully.",

            pregnancy,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

// Current Week
exports.getCurrentWeek = async (req, res) => {

    try {

        const pregnancy = await pregnancyService.getCurrentWeek(

            TEST_USER_ID

        );

        res.json({

            success: true,

            pregnancy,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

// Baby Growth
exports.getBabyGrowth = async (req, res) => {

    try {

        const growth = await pregnancyService.getBabyGrowth(

            TEST_USER_ID

        );

        res.json({

            success: true,

            growth,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

// Weekly Tips
exports.getWeeklyTips = async (req, res) => {

    try {

        const tips = await pregnancyService.getWeeklyTips(

            TEST_USER_ID

        );

        res.json({

            success: true,

            tips,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

// Pregnancy Calendar
exports.getCalendar = async (req, res) => {

    try {

        const calendar = await pregnancyService.getCalendar(

            TEST_USER_ID

        );

        res.json({

            success: true,

            calendar,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

// Update Pregnancy
exports.updatePregnancy = async (req, res) => {

    try {

        const pregnancy = await pregnancyService.updatePregnancy(

            req.params.id,

            TEST_USER_ID,

            req.body

        );

        res.json({

            success: true,

            pregnancy,

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};

// Delete Pregnancy
exports.deletePregnancy = async (req, res) => {

    try {

        await pregnancyService.deletePregnancy(

            req.params.id,

            TEST_USER_ID

        );

        res.json({

            success: true,

            message: "Pregnancy record deleted successfully.",

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};