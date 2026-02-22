/**
 * @fileoverview Dashboard Controller — aggregate stats from MongoDB.
 */

const { PriceAnalysis, PriceAlert } = require('../../../models');
const { asyncHandler } = require('../../../utils/asyncHandler');

const getStats = asyncHandler(async (_req, res) => {
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
    PriceAnalysis.countDocuments(),

    // 2. Analyses by type (product/hotel/flight)
    PriceAnalysis.aggregate([
      { $group: { _id: '$payload.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // 3. Price position distribution
    PriceAnalysis.aggregate([
      { $group: { _id: '$result.pricePosition', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // 4. Average confidence score
    PriceAnalysis.aggregate([
      { $group: { _id: null, avg: { $avg: '$result.confidenceScore' } } },
    ]),

    // 5. Recent 5 analyses
    PriceAnalysis.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('payload.type payload.metadata.title payload.price result.pricePosition result.confidenceScore createdAt')
      .lean(),

    // 6. Top 5 most-analyzed items
    PriceAnalysis.aggregate([
      { $group: {
        _id: { $ifNull: ['$payload.metadata.title', '$payload.type'] },
        count: { $sum: 1 },
        type: { $first: '$payload.type' },
        avgPrice: { $avg: '$payload.price' },
      }},
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),

    // 7. Active alerts count
    PriceAlert.countDocuments({ status: 'active' }),
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
        type: a.payload?.type,
        title: a.payload?.metadata?.title || a.payload?.type,
        price: a.payload?.price,
        position: a.result?.pricePosition,
        confidence: a.result?.confidenceScore,
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
