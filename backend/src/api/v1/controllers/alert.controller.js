/**
 * @fileoverview Alert controller - handles CRUD + toggle for price alerts.
 */

const alertService = require('../services/alert.service');
const { asyncHandler } = require('../../../utils/asyncHandler');

const createAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.createAlert(req.user.id, req.body, req.user.email);
  res.status(201).json({
    success: true,
    message: 'Price alert created',
    data: alert,
  });
});

const getAllAlerts = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const result = await alertService.getAllAlerts(req.user.id, { status, type });
  res.json({
    success: true,
    data: result.data,
    count: result.total,
  });
});

const getAlertById = asyncHandler(async (req, res) => {
  const alert = await alertService.getAlertById(req.user.id, req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  return res.json({ success: true, data: alert });
});

const updateAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.updateAlert(req.user.id, req.params.id, req.body);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  return res.json({ success: true, message: 'Alert updated', data: alert });
});

const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.deleteAlert(req.user.id, req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  return res.json({ success: true, message: 'Alert deleted' });
});

const togglePause = asyncHandler(async (req, res) => {
  const alert = await alertService.togglePause(req.user.id, req.params.id);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  return res.json({ success: true, message: `Alert ${alert.status}`, data: alert });
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await alertService.getStats(req.user.id);
  res.json({ success: true, data: stats });
});

module.exports = {
  createAlert,
  getAllAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  togglePause,
  getStats,
};
