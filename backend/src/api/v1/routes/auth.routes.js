/**
 * @fileoverview Authentication routes (register, login, refresh, logout).
 */

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../../../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
