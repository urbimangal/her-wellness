const menstrualService = require("../services/menstrualService");
const validateCycle = require("../validators/menstrualValidator");
const TEST_USER_ID = "6a4ce83255fc73284bbbfc5b";
exports.saveCycle = async (req, res) => {

    try {

        const errors = validateCycle(req.body);

        if (errors.length) {

            return res.status(400).json({

                success: false,

                errors

            });

        }

        const cycle = await menstrualService.saveCycle(

            //req.user.id,
            TEST_USER_ID,
            req.body

        );

        res.status(201).json({

            success: true,

            message: "Cycle saved successfully.",

            cycle

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getPrediction = async (req, res) => {

    try {

        const prediction = await menstrualService.getPrediction(TEST_USER_ID);

        res.json({

            success: true,

            prediction

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getCalendar = async (req, res) => {

    try {

        const calendar = await menstrualService.getCalendar(TEST_USER_ID);

        res.json({

            success: true,

            calendar

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getHistory = async (req, res) => {

    try {

        const history = await menstrualService.getHistory(TEST_USER_ID);

        res.json({

            success: true,

            history

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.updateCycle = async (req, res) => {

    try {

        const cycle = await menstrualService.updateCycle(

            req.params.id,

            TEST_USER_ID,

            req.body

        );

        res.json({

            success: true,

            cycle

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.deleteCycle = async (req, res) => {

    try {

        await menstrualService.deleteCycle(

            req.params.id,

            TEST_USER_ID

        );

        res.json({

            success: true,

            message: "Cycle deleted successfully."

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};