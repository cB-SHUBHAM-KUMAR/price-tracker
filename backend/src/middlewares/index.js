/**
 * @fileoverview Barrel export for all global middlewares.
 */

const { globalErrorHandler } = require('./error.middleware');
const { notFoundHandler } = require('./notFound.middleware');
const { authenticate, attachUserIfPresent, authorize } = require('./auth.middleware');
const { rateLimiter } = require('./rateLimiter.middleware');
const { requestIdMiddleware } = require('./requestId.middleware');
const { validate } = require('./validation.middleware');

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  authenticate,
  attachUserIfPresent,
  authorize,
  rateLimiter,
  requestIdMiddleware,
  validate,
};
