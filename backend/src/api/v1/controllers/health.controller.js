/**
 * @fileoverview Health check controller.
 */

const ResponseFormatter = require('../../../utils/responseFormatter');

const check = (_req, res) => {
  ResponseFormatter.success(res, {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: process.memoryUsage(),
  }, 'Server is healthy');
};

module.exports = { check };
