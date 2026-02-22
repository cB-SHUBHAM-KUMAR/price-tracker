/**
 * @fileoverview PriceAlert repository.
 */

const BaseRepository = require('./base.repository');
const PriceAlert = require('../models/priceAlert.model');

class PriceAlertRepository extends BaseRepository {
  constructor() {
    super(PriceAlert);
  }

  async findByUser(userId, filters = {}, options = {}) {
    return this.findAll({ userId, ...filters }, options);
  }

  async findByIdForUser(id, userId) {
    return this.model.findOne({ _id: id, userId });
  }

  async updateByIdForUser(id, userId, updates) {
    return this.model.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );
  }

  async deleteByIdForUser(id, userId) {
    return this.model.findOneAndDelete({ _id: id, userId });
  }

  async findActive() {
    return this.model.find({ status: 'active' }).sort('-createdAt');
  }

  async findByStatus(status) {
    return this.model.find({ status }).sort('-createdAt');
  }

  async markTriggered(id, price) {
    return this.model.findByIdAndUpdate(
      id,
      { status: 'triggered', triggeredAt: new Date(), lastCheckedPrice: price },
      { new: true }
    );
  }

  async getAlertStats() {
    return this.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new PriceAlertRepository();
