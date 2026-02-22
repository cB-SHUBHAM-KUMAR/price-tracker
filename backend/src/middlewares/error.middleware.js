/**
 * @fileoverview Global error handling middleware — catches all errors thrown
 * or passed via next(err) and returns a standardised JSON response.
 */

const logger = require('../config/logger.config');

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(err.message, {
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });

  // Operational, trusted errors — send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Programming or unknown errors — don't leak details
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

module.exports = { globalErrorHandler };
