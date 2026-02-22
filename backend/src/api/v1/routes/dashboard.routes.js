/**
 * @fileoverview Dashboard Routes.
 */

const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = Router();

// GET /api/v1/dashboard/stats — Aggregate dashboard stats
router.get('/stats', authenticate, dashboardController.getStats);

module.exports = router;
