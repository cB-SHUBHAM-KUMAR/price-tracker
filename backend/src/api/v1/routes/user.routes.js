/**
 * @fileoverview User CRUD routes.
 */

const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../../../middlewares/auth.middleware');
const { validate } = require('../../../middlewares/validation.middleware');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');

const router = Router();

// All routes below require authentication
router.use(authenticate);

router.get('/', authorize('admin'), userController.getAll);
router.get('/me', userController.getMe);
router.get('/:id', authorize('admin'), userController.getById);
router.post('/', authorize('admin'), validate(createUserSchema), userController.create);
router.put('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', authorize('admin'), userController.delete);

module.exports = router;
