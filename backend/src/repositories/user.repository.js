/**
 * @fileoverview User repository — extends BaseRepository with user-specific queries.
 */

const BaseRepository = require('./base.repository');
const { User } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email }).select('+password');
  }

  async findActiveUsers(options) {
    return this.findAll({ status: 'active' }, options);
  }
}

module.exports = new UserRepository();
