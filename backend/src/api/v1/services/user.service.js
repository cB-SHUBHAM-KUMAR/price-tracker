/**
 * @fileoverview User service — business logic for user management.
 */

const { userRepository } = require('../../../repositories');
const { NotFoundError } = require('../../../errors');

class UserService {
  async getAllUsers(options) {
    return userRepository.findAll({}, options);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async createUser(data) {
    return userRepository.create(data);
  }

  async updateUser(id, data) {
    const user = await userRepository.updateById(id, data);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async deleteUser(id) {
    const user = await userRepository.deleteById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }
}

module.exports = new UserService();
