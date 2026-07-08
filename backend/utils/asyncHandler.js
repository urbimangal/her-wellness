/**
 * Wraps an async controller/middleware function and forwards any
 * rejected promise / thrown error to Express's next() so the central
 * error handler can process it, avoiding repetitive try/catch blocks.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
