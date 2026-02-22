/**
 * @fileoverview Event subscribers — listen to domain events and trigger side effects.
 * Example: Send a welcome email after user registration.
 */

const logger = require('../config/logger.config');

const onUserRegistered = (user) => {
  logger.info(`New user registered: ${user.email}`);
  // TODO: Send welcome email, create default settings, etc.
};

const onUserDeleted = (userId) => {
  logger.info(`User deleted: ${userId}`);
  // TODO: Clean up user data, revoke tokens, etc.
};

module.exports = { onUserRegistered, onUserDeleted };
