/**
 * Custom error class used across the app to represent operational
 * errors with an explicit HTTP status code. Thrown from controllers/
 * services and caught by the centralized error-handling middleware.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional array of field-level validation errors
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
