/**
 * @fileoverview Attaches a unique request ID to every incoming request
 * for distributed tracing and structured logging.
 */

const crypto = require('crypto');

const requestIdMiddleware = (req, _res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  next();
};

module.exports = { requestIdMiddleware };
