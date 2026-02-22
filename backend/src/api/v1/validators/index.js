const { registerSchema, loginSchema } = require('./auth.validator');
const { createUserSchema, updateUserSchema } = require('./user.validator');
const { analyzePriceSchema } = require('./price.validator');
const { createAlertSchema, updateAlertSchema } = require('./alert.validator');

module.exports = { registerSchema, loginSchema, createUserSchema, updateUserSchema, analyzePriceSchema, createAlertSchema, updateAlertSchema };

