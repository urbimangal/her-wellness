require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const startReminderCron = require("./jobs/reminderCron");

// Route imports — one file per topic, as requested
const sosRoutes = require("./routes/sosRoutes");
const nearbyRoutes = require("./routes/nearbyRoutes");
const communityRoutes = require("./routes/communityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

const app = express();

// Core middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "HerWellness API is running" });
});

// Mounted module routes
app.use("/api/sos", sosRoutes);
app.use("/api/nearby", nearbyRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reminders", reminderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (catches anything thrown/passed to next())
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startReminderCron();
  });
});
