/**
 * @fileoverview User test fixtures.
 */

const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123!',
  role: 'user',
};

const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'AdminPass123!',
  role: 'admin',
};

module.exports = { validUser, adminUser };
