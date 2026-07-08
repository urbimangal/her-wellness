const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const menstrualRoutes = require("./routes/menstrualRoutes");
const aiRoutes = require("./routes/aiRoutes");
const profileRoutes = require('./routes/profileRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ---- Global middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Health check ----
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Service is healthy' });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/menstrual", menstrualRoutes);
// ---- 404 + centralized error handling ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
