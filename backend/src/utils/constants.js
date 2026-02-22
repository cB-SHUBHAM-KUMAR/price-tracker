/**
 * @fileoverview Application-wide constants.
 */

const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

const STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
});

module.exports = { ROLES, PAGINATION, STATUS };
