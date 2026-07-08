const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createMedicineReminder,
  getMedicineReminders,
  updateMedicineReminder,
  deleteMedicineReminder,
  markDoseTaken,
  getDueTodayMedicineReminders,
  createAppointmentReminder,
  getAppointmentReminders,
  updateAppointmentReminder,
  updateAppointmentStatus,
  deleteAppointmentReminder,
  sendTestReminderNotification,
} = require("../controllers/reminderController");

router.use(protect);

// Medicine Reminders
router.post("/medicine", createMedicineReminder);
router.get("/medicine", getMedicineReminders);
router.get("/medicine/due-today", getDueTodayMedicineReminders);
router.put("/medicine/:id", updateMedicineReminder);
router.put("/medicine/:id/mark-taken", markDoseTaken);
router.delete("/medicine/:id", deleteMedicineReminder);

// Doctor Appointment Reminders
router.post("/appointments", createAppointmentReminder);
router.get("/appointments", getAppointmentReminders);
router.put("/appointments/:id", updateAppointmentReminder);
router.put("/appointments/:id/status", updateAppointmentStatus);
router.delete("/appointments/:id", deleteAppointmentReminder);

// Notification test/dispatch
router.post("/notify/test", sendTestReminderNotification);

module.exports = router;
