/**
 * @fileoverview User controller — CRUD operations delegated to userService.
 */

const { asyncHandler } = require('../../../utils/asyncHandler');
const ResponseFormatter = require('../../../utils/responseFormatter');
const { parsePagination } = require('../../../utils/helpers');
const userService = require('../services/user.service');

const getAll = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const result = await userService.getAllUsers(pagination);
  ResponseFormatter.paginated(res, result.data, {
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  ResponseFormatter.success(res, user);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  ResponseFormatter.success(res, user);
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  ResponseFormatter.created(res, user);
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  ResponseFormatter.success(res, user, 'User updated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  ResponseFormatter.noContent(res);
});

module.exports = { getAll, getById, getMe, create, update, delete: deleteUser };
