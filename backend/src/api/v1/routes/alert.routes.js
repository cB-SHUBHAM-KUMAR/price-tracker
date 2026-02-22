/**
 * @fileoverview Alert Routes.
 */

const { Router } = require('express');
const alertController = require('../controllers/alert.controller');
const { validate } = require('../../../middlewares/validation.middleware');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { createAlertSchema, updateAlertSchema } = require('../validators/alert.validator');

const router = Router();

// All alert routes require authentication
router.use(authenticate);

router.get('/stats', alertController.getStats);
router.get('/', alertController.getAllAlerts);
router.get('/:id', alertController.getAlertById);
router.post('/', validate(createAlertSchema), alertController.createAlert);
router.put('/:id', validate(updateAlertSchema), alertController.updateAlert);
router.patch('/:id/toggle', alertController.togglePause);
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
