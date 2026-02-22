/**
 * @fileoverview V1 API router — aggregates all v1 sub-routes.
 */

const { Router } = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const healthRoutes = require('./routes/health.routes');
const priceRoutes = require('./routes/price.routes');
const alertRoutes = require('./routes/alert.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/price', priceRoutes);
router.use('/alerts', alertRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
