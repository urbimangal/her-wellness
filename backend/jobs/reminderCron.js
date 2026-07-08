const cron = require("node-cron");
const MedicineReminder = require("../models/MedicineReminder");
const AppointmentReminder = require("../models/AppointmentReminder");
const Notification = require("../models/Notification");

// Runs every minute, checks if any medicine dose time matches "now" (HH:MM)
// and any appointment is within its remindBeforeMinutes window, then creates
// an in-app Notification. Swap console logs for real email/SMS/push calls.
const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

      // ---- Medicine reminders due right now ----
      const medicineReminders = await MedicineReminder.find({
        isActive: true,
        times: currentTime,
      });

      for (const reminder of medicineReminders) {
        await Notification.create({
          userId: reminder.userId,
          title: "Medicine Reminder",
          message: `Time to take ${reminder.medicineName} (${reminder.dosage || "as prescribed"})`,
          type: "reminder",
          channel: "in-app",
        });
      }

      // ---- Appointments approaching their reminder window ----
      const upcoming = await AppointmentReminder.find({ status: "upcoming" });

      for (const appt of upcoming) {
        const msUntil = new Date(appt.appointmentDate).getTime() - now.getTime();
        const minutesUntil = Math.round(msUntil / 60000);

        if (minutesUntil === appt.remindBeforeMinutes) {
          await Notification.create({
            userId: appt.userId,
            title: "Upcoming Appointment",
            message: `Appointment with Dr. ${appt.doctorName} in ${appt.remindBeforeMinutes} minutes`,
            type: "reminder",
            channel: "in-app",
          });
        }
      }
    } catch (error) {
      console.error("Reminder cron error:", error.message);
    }
  });

  console.log("Reminder cron job started (runs every minute).");
};

module.exports = startReminderCron;
