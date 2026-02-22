/**
 * @fileoverview Price analysis Joi validation schema.
 */

const Joi = require('joi');

const analyzePriceSchema = Joi.object({
  type: Joi.string().valid('product', 'hotel', 'flight').required().messages({
    'any.only': 'Type must be one of: product, hotel, flight',
    'any.required': 'Type is required',
  }),
  price: Joi.number().positive().max(10000000).required().messages({
    'number.positive': 'Price must be a positive number',
    'number.max': 'Price cannot exceed 10,000,000',
    'any.required': 'Price is required',
  }),
  currency: Joi.string().trim().uppercase().valid('INR', 'USD', 'EUR', 'GBP').default('INR').messages({
    'any.only': 'Currency must be one of: INR, USD, EUR, GBP',
  }),
  metadata: Joi.object({
    title: Joi.string().trim().allow('').max(300),
    brand: Joi.string().trim().allow('').max(100),
    category: Joi.string().trim().allow('').max(100),
    location: Joi.string().trim().allow('').max(200),
    travelDate: Joi.string().trim().allow('').custom((value, helpers) => {
      if (!value) return value;
      const date = new Date(value);
      if (isNaN(date.getTime())) return helpers.error('any.invalid');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return helpers.error('date.min');
      return value;
    }).messages({
      'any.invalid': 'Travel date must be a valid date',
      'date.min': 'Travel date cannot be in the past',
    }),
    route: Joi.string().trim().allow('').max(200),
  }).default({}),
});

module.exports = { analyzePriceSchema };
