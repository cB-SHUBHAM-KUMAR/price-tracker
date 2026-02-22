/**
 * @fileoverview Alert Validator - Joi schemas for price alert operations.
 */

const Joi = require('joi');

const createAlertSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  type: Joi.string().valid('product', 'hotel', 'flight').required(),
  targetPrice: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  condition: Joi.string().valid('below', 'above', 'equals').default('below'),
  metadata: Joi.object({
    title: Joi.string().trim().allow('').max(300),
    brand: Joi.string().trim().allow('').max(100),
    category: Joi.string().trim().allow('').max(100),
    location: Joi.string().trim().allow('').max(200),
    route: Joi.string().trim().allow('').max(200),
  }).default({}),
  notifyEmail: Joi.string().email().allow(''),
  trackingUrl: Joi.string().trim().uri().required(),
});

const updateAlertSchema = Joi.object({
  title: Joi.string().trim().max(200),
  targetPrice: Joi.number().positive(),
  condition: Joi.string().valid('below', 'above', 'equals'),
  status: Joi.string().valid('active', 'paused'),
  notifyEmail: Joi.string().email().allow(''),
  trackingUrl: Joi.string().trim().uri().allow(''),
}).min(1);

module.exports = { createAlertSchema, updateAlertSchema };
