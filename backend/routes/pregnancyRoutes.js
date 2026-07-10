const express = require("express");

const router = express.Router();

const pregnancyController = require("../controllers/pregnancyController");
const protect = require("../middleware/authMiddleware");

// Start Pregnancy
router.post(
  "/start",
  protect,
  pregnancyController.startPregnancy
);

// Current Week
router.get(
  "/week",
  protect,
  pregnancyController.getCurrentWeek
);

// Baby Growth
router.get(
  "/growth",
  protect,
  pregnancyController.getBabyGrowth
);

// Weekly Tips
router.get(
  "/tips",
  protect,
  pregnancyController.getWeeklyTips
);

// Pregnancy Calendar
router.get(
  "/calendar",
  protect,
  pregnancyController.getCalendar
);

// Update Pregnancy
router.put(
  "/:id",
  protect,
  pregnancyController.updatePregnancy
);

// Delete Pregnancy
router.delete(
  "/:id",
  protect,
  pregnancyController.deletePregnancy
);

module.exports = router;