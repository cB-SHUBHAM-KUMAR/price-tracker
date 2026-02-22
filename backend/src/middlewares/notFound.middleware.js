/**
 * @fileoverview 404 Not Found handler for unmatched routes.
 */

const { NotFoundError } = require('../errors');

const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
};

module.exports = { notFoundHandler };
