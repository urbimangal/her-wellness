const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB using Mongoose.
 * Exits the process on failure since the app cannot function without a DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
