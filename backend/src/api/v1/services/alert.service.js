/**
 * @fileoverview Alert service - CRUD + trigger logic for price alerts.
 */

const mongoose = require('mongoose');
const priceAlertRepository = require('../../../repositories/priceAlert.repository');
const logger = require('../../../config/logger.config');

class AlertService {
  async createAlert(userId, data, fallbackEmail = '') {
    logger.info('Creating price alert', {
      userId,
      title: data.title,
      targetPrice: data.targetPrice,
    });

    return priceAlertRepository.create({
      ...data,
      userId,
      notifyEmail: data.notifyEmail || fallbackEmail || undefined,
    });
  }

  async getAllAlerts(userId, filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;

    return priceAlertRepository.findByUser(userId, query, { sort: '-createdAt' });
  }

  async getActiveAlerts() {
    return priceAlertRepository.findActive();
  }

  async getAlertById(userId, id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return priceAlertRepository.findByIdForUser(id, userId);
  }

  async updateAlert(userId, id, updates) {
    if (!mongoose.isValidObjectId(id)) return null;
    return priceAlertRepository.updateByIdForUser(id, userId, updates);
  }

  async deleteAlert(userId, id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return priceAlertRepository.deleteByIdForUser(id, userId);
  }

  async togglePause(userId, id) {
    const alert = await this.getAlertById(userId, id);
    if (!alert) return null;

    const newStatus = alert.status === 'active' ? 'paused' : 'active';
    return priceAlertRepository.updateByIdForUser(id, userId, { status: newStatus });
  }

  async checkAlerts(currentPrice, type) {
    const activeAlerts = await priceAlertRepository.model.find({
      status: 'active',
      type,
    });

    const triggered = [];
    for (const alert of activeAlerts) {
      let shouldTrigger = false;
      if (alert.condition === 'below' && currentPrice <= alert.targetPrice) shouldTrigger = true;
      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) shouldTrigger = true;
      if (alert.condition === 'equals' && Math.abs(currentPrice - alert.targetPrice) < 1) shouldTrigger = true;

      if (shouldTrigger) {
        await priceAlertRepository.markTriggered(alert._id, currentPrice);
        triggered.push(alert);
        logger.info('Alert triggered', {
          id: alert._id,
          title: alert.title,
          price: currentPrice,
        });
      }
    }

    return triggered;
  }

  async getStats(userId) {
    return priceAlertRepository.model.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new AlertService();
