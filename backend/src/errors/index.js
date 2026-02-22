/**
 * @fileoverview Barrel export for all custom error classes.
 */

const AppError = require('./AppError');
const NotFoundError = require('./NotFoundError');
const ValidationError = require('./ValidationError');
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
};
