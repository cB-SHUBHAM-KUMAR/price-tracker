/**
 * @fileoverview Wraps async route handlers to forward rejected promises
 * to the global error handler automatically.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
