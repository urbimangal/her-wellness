const HealthScore = require("../models/HealthScore");
const Notification = require("../models/Notification");
const Activity = require("../models/Activity");

/* ------------------------------- HEALTH SCORE ------------------------------- */

// @route POST /api/dashboard/health-score
// @desc  Calculate & save today's health score from factor inputs
exports.saveHealthScore = async (req, res) => {
  try {
    const { sleepScore = 0, activityScore = 0, moodScore = 0, hydrationScore = 0, cycleRegularityScore = 0 } = req.body;

    // simple weighted average — tweak weights as the AI/analytics teammate refines the model
    const score = Math.round(
      sleepScore * 0.25 +
        activityScore * 0.25 +
        moodScore * 0.2 +
        hydrationScore * 0.15 +
        cycleRegularityScore * 0.15
    );

    const entry = await HealthScore.create({
      userId: req.user.id,
      score,
      factors: { sleepScore, activityScore, moodScore, hydrationScore, cycleRegularityScore },
    });

    res.status(201).json({ success: true, message: "Health score saved", data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/dashboard/health-score/latest
exports.getLatestHealthScore = async (req, res) => {
  try {
    const latest = await HealthScore.findOne({ userId: req.user.id }).sort({ date: -1 });
    if (!latest) return res.status(404).json({ success: false, message: "No health score recorded yet" });
    res.status(200).json({ success: true, data: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/dashboard/health-score/history?days=30
exports.getHealthScoreHistory = async (req, res) => {
  try {
    const days = +req.query.days || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await HealthScore.find({ userId: req.user.id, date: { $gte: since } }).sort({ date: 1 });
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------------------- NOTIFICATIONS ------------------------------- */

// @route POST /api/dashboard/notifications
// @desc  Create a notification (called internally by reminders/SOS/community modules)
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, channel, link } = req.body;

    const notification = await Notification.create({
      userId: userId || req.user.id,
      title,
      message,
      type,
      channel,
      link,
    });

    res.status(201).json({ success: true, message: "Notification created", data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/dashboard/notifications?unreadOnly=true
exports.getNotifications = async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.unreadOnly === "true") filter.isRead = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/dashboard/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/dashboard/notifications/read-all
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/dashboard/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------------------- ACTIVITY --------------------------------- */

// @route POST /api/dashboard/activity
// @desc  Log a piece of recent activity (steps, mood log, medicine taken, etc.)
exports.logActivity = async (req, res) => {
  try {
    const { type, description, value, icon } = req.body;

    if (!type || !description) {
      return res.status(400).json({ success: false, message: "type and description are required" });
    }

    const activity = await Activity.create({ userId: req.user.id, type, description, value, icon });
    res.status(201).json({ success: true, message: "Activity logged", data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/dashboard/activity/recent?limit=10
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = +req.query.limit || 10;
    const activities = await Activity.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(limit);
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------------------- ANALYTICS --------------------------------- */

// @route GET /api/dashboard/analytics/health-trend?days=30
// @desc  Overall health score trend line
exports.getHealthTrend = async (req, res) => {
  try {
    const days = +req.query.days || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await HealthScore.find({ userId: req.user.id, date: { $gte: since } })
      .sort({ date: 1 })
      .select("date score -_id");

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/dashboard/analytics/activity-breakdown?days=7
// @desc  Pie-chart style breakdown of activity types logged (e.g. workout vs mood_log vs steps)
exports.getActivityBreakdown = async (req, res) => {
  try {
    const days = +req.query.days || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const breakdown = await Activity.aggregate([
      { $match: { userId: req.user.id, createdAt: { $gte: since } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, data: breakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/dashboard/analytics/factor-trend?factor=sleepScore&days=30
// @desc  Trend for one specific health-score factor (sleep, activity, mood, hydration, cycle)
exports.getFactorTrend = async (req, res) => {
  try {
    const { factor = "sleepScore", days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - +days);

    const validFactors = ["sleepScore", "activityScore", "moodScore", "hydrationScore", "cycleRegularityScore"];
    if (!validFactors.includes(factor)) {
      return res.status(400).json({ success: false, message: `factor must be one of: ${validFactors.join(", ")}` });
    }

    const scores = await HealthScore.find({ userId: req.user.id, date: { $gte: since } }).sort({ date: 1 });
    const data = scores.map((s) => ({ date: s.date, value: s.factors[factor] }));

    res.status(200).json({ success: true, factor, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
