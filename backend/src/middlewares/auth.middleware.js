/**
 * @fileoverview JWT-based authentication middleware.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError } = require('../errors');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Verifies the JWT token in the Authorization header.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is missing or invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
});

/**
 * Restricts access to specific roles.
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('You are not authorized to access this resource');
    }
    next();
  };
};

module.exports = { authenticate, authorize };
