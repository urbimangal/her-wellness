const MedicineReminder = require("../models/MedicineReminder");
const AppointmentReminder = require("../models/AppointmentReminder");
const Notification = require("../models/Notification");

/* ------------------------------ MEDICINE REMINDER ------------------------------ */

// @route POST /api/reminders/medicine
exports.createMedicineReminder = async (req, res) => {
  try {
    const { medicineName, dosage, frequency, times, startDate, endDate, notes } = req.body;

    if (!medicineName || !times || !times.length) {
      return res.status(400).json({ success: false, message: "medicineName and times[] are required" });
    }

    const reminder = await MedicineReminder.create({
      userId: req.user.id,
      medicineName,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({ success: true, message: "Medicine reminder created", data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/reminders/medicine?activeOnly=true
exports.getMedicineReminders = async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.activeOnly === "true") filter.isActive = true;

    const reminders = await MedicineReminder.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/reminders/medicine/:id
exports.updateMedicineReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });
    res.status(200).json({ success: true, message: "Reminder updated", data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/reminders/medicine/:id
exports.deleteMedicineReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });
    res.status(200).json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/reminders/medicine/:id/mark-taken
// body: { date: "2026-07-07", time: "08:00" }
exports.markDoseTaken = async (req, res) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ success: false, message: "date and time are required" });

    const reminder = await MedicineReminder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });

    const existingLog = reminder.logs.find(
      (l) => l.date.toISOString().slice(0, 10) === date && l.time === time
    );

    if (existingLog) {
      existingLog.taken = true;
      existingLog.takenAt = new Date();
    } else {
      reminder.logs.push({ date: new Date(date), time, taken: true, takenAt: new Date() });
    }

    await reminder.save();
    res.status(200).json({ success: true, message: "Dose marked as taken", data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/reminders/medicine/due-today
// @desc  Reminders that have a dose scheduled for today (for the app to display / cron to notify)
exports.getDueTodayMedicineReminders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminders = await MedicineReminder.find({
      userId: req.user.id,
      isActive: true,
      startDate: { $lte: today },
      $or: [{ endDate: null }, { endDate: { $gte: today } }],
    });

    res.status(200).json({ success: true, count: reminders.length, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---------------------------- DOCTOR APPOINTMENT REMINDER ---------------------------- */

// @route POST /api/reminders/appointments
exports.createAppointmentReminder = async (req, res) => {
  try {
    const { doctorName, hospitalOrClinic, reason, appointmentDate, location, remindBeforeMinutes, notes } = req.body;

    if (!doctorName || !appointmentDate) {
      return res.status(400).json({ success: false, message: "doctorName and appointmentDate are required" });
    }

    const appointment = await AppointmentReminder.create({
      userId: req.user.id,
      doctorName,
      hospitalOrClinic,
      reason,
      appointmentDate,
      location,
      remindBeforeMinutes,
      notes,
    });

    res.status(201).json({ success: true, message: "Appointment reminder created", data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/reminders/appointments?status=upcoming
exports.getAppointmentReminders = async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const appointments = await AppointmentReminder.find(filter).sort({ appointmentDate: 1 });
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/reminders/appointments/:id
exports.updateAppointmentReminder = async (req, res) => {
  try {
    const appointment = await AppointmentReminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.status(200).json({ success: true, message: "Appointment updated", data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/reminders/appointments/:id/status
// body: { status: "completed" | "missed" | "cancelled" }
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["upcoming", "completed", "missed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const appointment = await AppointmentReminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/reminders/appointments/:id
exports.deleteAppointmentReminder = async (req, res) => {
  try {
    const appointment = await AppointmentReminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.status(200).json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* -------------------------------- NOTIFICATION DISPATCH -------------------------------- */
// These wrap the Notification model (owned by Dashboard module) so the reminder
// system can push alerts through the same in-app/email/SMS channel.

// @route POST /api/reminders/notify/test
// @desc  Manually trigger a reminder notification (useful for testing push/SMS wiring)
exports.sendTestReminderNotification = async (req, res) => {
  try {
    const { title, message, channel } = req.body;

    const notification = await Notification.create({
      userId: req.user.id,
      title: title || "Reminder",
      message: message || "This is a test reminder notification.",
      type: "reminder",
      channel: channel || "in-app",
    });

    // TODO: integrate real email/SMS provider here, e.g.:
    // if (channel === "email") await sendEmail(...)
    // if (channel === "sms") await sendSMS(...)

    res.status(201).json({ success: true, message: "Reminder notification sent", data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
