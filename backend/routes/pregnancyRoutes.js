const express = require("express");

const router = express.Router();

const pregnancyController = require("../controllers/pregnancyController");

// const authMiddleware = require("../middleware/authMiddleware");

// Start Pregnancy

router.post(

    "/start",

    // authMiddleware,

    pregnancyController.startPregnancy

);

// Current Week

router.get(

    "/week",

    // authMiddleware,

    pregnancyController.getCurrentWeek

);

// Baby Growth

router.get(

    "/growth",

    // authMiddleware,

    pregnancyController.getBabyGrowth

);

// Weekly Tips

router.get(

    "/tips",

    // authMiddleware,

    pregnancyController.getWeeklyTips

);

// Pregnancy Calendar

router.get(

    "/calendar",

    // authMiddleware,

    pregnancyController.getCalendar

);

// Update Pregnancy

router.put(

    "/update/:id",

    // authMiddleware,

    pregnancyController.updatePregnancy

);

// Delete Pregnancy

router.delete(

    "/delete/:id",

    // authMiddleware,

    pregnancyController.deletePregnancy

);

module.exports = router;