/**
 * @fileoverview Auth service — business logic for authentication.
 */

const jwt = require('jsonwebtoken');
const config = require('../../../config');
const { userRepository } = require('../../../repositories');
const { UnauthorizedError } = require('../../../errors');
const { AppError } = require('../../../errors');

class AuthService {
  async register({ name, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const user = await userRepository.create({ name, email, password });
    const tokens = this._generateTokens(user);

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = this._generateTokens(user);

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      const user = await userRepository.findById(decoded.id);
      if (!user) throw new UnauthorizedError('User not found');

      return this._generateTokens(user);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(_userId) {
    // Implement token blacklisting or session invalidation if needed
    return true;
  }

  _generateTokens(user) {
    const payload = { id: user._id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn,
    });
    const refreshToken = jwt.sign({ id: user._id }, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
