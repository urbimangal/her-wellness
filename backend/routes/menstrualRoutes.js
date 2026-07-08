const express = require("express");

const router = express.Router();

const menstrualController = require("../controllers/menstrualController");

// const authMiddleware = require("../middleware/authMiddleware");

// Save Cycle
router.post(
    "/save",
    // authMiddleware,
    menstrualController.saveCycle
);

// Prediction
router.get(
    "/predict",
    // authMiddleware,
    menstrualController.getPrediction
);

// Calendar
router.get(
    "/calendar",
    // authMiddleware,
    menstrualController.getCalendar
);

// History
router.get(
    "/history",
    // authMiddleware,
    menstrualController.getHistory
);

// Update
router.put(
    "/update/:id",
    // authMiddleware,
    menstrualController.updateCycle
);

// Delete
router.delete(
    "/delete/:id",
    // authMiddleware,
    menstrualController.deleteCycle
);

module.exports = router;