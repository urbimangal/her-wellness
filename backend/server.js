const app = require('./app');
const connectDB = require('./config/db');
const path = require("path");
const { port, nodeEnv, isTwilioConfigured } = require('./config/env');

const startServer = async () => {
  await connectDB();
// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Fallback for SPA routing (if needed)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

  app.listen(port, () => {
    console.log(`Server Running in ${nodeEnv} mode on port ${port}`);
  });
};

startServer();

// Safety nets for uncaught issues.
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
  process.exit(1);
});
