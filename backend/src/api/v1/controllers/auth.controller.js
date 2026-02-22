/**
 * @fileoverview Auth controller — thin layer that delegates to authService.
 */

const { asyncHandler } = require('../../../utils/asyncHandler');
const ResponseFormatter = require('../../../utils/responseFormatter');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  ResponseFormatter.created(res, result, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ResponseFormatter.success(res, result, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  ResponseFormatter.success(res, result, 'Token refreshed successfully');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user?.id);
  ResponseFormatter.success(res, null, 'Logout successful');
});

module.exports = { register, login, refreshToken, logout };
