/**
 * @fileoverview Joi-based request validation middleware factory.
 */

const { ValidationError } = require('../errors');

/**
 * Creates a middleware that validates req[source] against a Joi schema.
 * @param {import('joi').ObjectSchema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return next(new ValidationError('Validation failed', errors));
    }

    req[source] = value; // replace with sanitised data
    next();
  };
};

module.exports = { validate };
