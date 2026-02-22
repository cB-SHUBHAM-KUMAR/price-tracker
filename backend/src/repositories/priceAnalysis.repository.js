/**
 * @fileoverview PriceAnalysis repository.
 */

const BaseRepository = require('./base.repository');
const PriceAnalysis = require('../models/priceAnalysis.model');

class PriceAnalysisRepository extends BaseRepository {
  constructor() {
    super(PriceAnalysis);
  }

  async findByType(type, options) {
    return this.findAll({ type }, options);
  }

  async findRecent(limit = 20) {
    return this.model.find().sort('-createdAt').limit(limit);
  }

  async getStats() {
    return this.model.aggregate([
      {
        $group: {
          _id: '$pricePosition',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidenceScore' },
        },
      },
    ]);
  }
}

module.exports = new PriceAnalysisRepository();
