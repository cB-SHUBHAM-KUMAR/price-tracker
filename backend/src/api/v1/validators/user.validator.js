/**
 * @fileoverview User Joi validation schemas.
 */

const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('user', 'admin', 'moderator').default('user'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().email().lowercase().trim(),
  role: Joi.string().valid('user', 'admin', 'moderator'),
  status: Joi.string().valid('active', 'inactive'),
}).min(1); // at least one field required

module.exports = { createUserSchema, updateUserSchema };
