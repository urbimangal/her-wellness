const app = require('./app');
const connectDB = require('./config/db');
const { port, nodeEnv, isTwilioConfigured } = require('./config/env');

const startServer = async () => {
  await connectDB();

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
