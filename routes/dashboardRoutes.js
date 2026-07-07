const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  saveHealthScore,
  getLatestHealthScore,
  getHealthScoreHistory,
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  logActivity,
  getRecentActivity,
  getHealthTrend,
  getActivityBreakdown,
  getFactorTrend,
} = require("../controllers/dashboardController");

router.use(protect);

// Health Score
router.post("/health-score", saveHealthScore);
router.get("/health-score/latest", getLatestHealthScore);
router.get("/health-score/history", getHealthScoreHistory);

// Notifications
router.post("/notifications", createNotification);
router.get("/notifications", getNotifications);
router.put("/notifications/:id/read", markNotificationRead);
router.put("/notifications/read-all", markAllNotificationsRead);
router.delete("/notifications/:id", deleteNotification);

// Recent Activity
router.post("/activity", logActivity);
router.get("/activity/recent", getRecentActivity);

// Analytics
router.get("/analytics/health-trend", getHealthTrend);
router.get("/analytics/activity-breakdown", getActivityBreakdown);
router.get("/analytics/factor-trend", getFactorTrend);

module.exports = router;
