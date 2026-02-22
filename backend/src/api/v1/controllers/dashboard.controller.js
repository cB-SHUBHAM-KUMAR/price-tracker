/**
 * @fileoverview Dashboard Controller — aggregate stats from MongoDB.
 */

const mongoose = require('mongoose');
const { PriceAnalysis, PriceAlert } = require('../../../models');
const { asyncHandler } = require('../../../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.user.id)) {
    res.json({
      success: true,
      stats: {
        totalAnalyses: 0,
        avgConfidence: 0,
        activeAlerts: 0,
        typeDistribution: [],
        positionDistribution: [],
        recentAnalyses: [],
        topItems: [],
      },
    });
    return;
  }

  const userFilter = { userId: new mongoose.Types.ObjectId(req.user.id) };

  // Run all aggregation queries in parallel
  const [
    totalCount,
    typeDistribution,
    positionDistribution,
    avgConfidence,
    recentAnalyses,
    topItems,
    activeAlertsCount,
  ] = await Promise.all([
    // 1. Total analyses
    PriceAnalysis.countDocuments(userFilter),

    // 2. Analyses by type (product/hotel/flight)
    PriceAnalysis.aggregate([
      { $match: userFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // 3. Price position distribution
    PriceAnalysis.aggregate([
      { $match: userFilter },
      { $group: { _id: '$pricePosition', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // 4. Average confidence score
    PriceAnalysis.aggregate([
      { $match: userFilter },
      { $group: { _id: null, avg: { $avg: '$confidenceScore' } } },
    ]),

    // 5. Recent 5 analyses
    PriceAnalysis.find(userFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type inputPayload.metadata.title inputPayload.price pricePosition confidenceScore createdAt')
      .lean(),

    // 6. Top 5 most-analyzed items
    PriceAnalysis.aggregate([
      { $match: userFilter },
      { $group: {
        _id: { $ifNull: ['$inputPayload.metadata.title', '$type'] },
        count: { $sum: 1 },
        type: { $first: '$type' },
        avgPrice: { $avg: '$inputPayload.price' },
      }},
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),

    // 7. Active alerts count
    PriceAlert.countDocuments({ userId: req.user.id, status: 'active' }),
  ]);

  res.json({
    success: true,
    stats: {
      totalAnalyses: totalCount,
      avgConfidence: avgConfidence[0]?.avg ? Math.round(avgConfidence[0].avg) : 0,
      activeAlerts: activeAlertsCount,
      typeDistribution: typeDistribution.map((t) => ({ type: t._id || 'unknown', count: t.count })),
      positionDistribution: positionDistribution.map((p) => ({ position: p._id || 'unknown', count: p.count })),
      recentAnalyses: recentAnalyses.map((a) => ({
        id: a._id,
        type: a.type,
        title: a.inputPayload?.metadata?.title || a.type,
        price: a.inputPayload?.price,
        position: a.pricePosition,
        confidence: a.confidenceScore,
        date: a.createdAt,
      })),
      topItems: topItems.map((t) => ({
        name: t._id,
        count: t.count,
        type: t.type,
        avgPrice: Math.round(t.avgPrice || 0),
      })),
    },
  });
});

module.exports = { getStats };
