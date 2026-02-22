/**
 * @fileoverview Multi-Platform Search Controller.
 */

const { searchAllPlatforms } = require('../services/multiPlatform.service');
const { asyncHandler } = require('../../../utils/asyncHandler');

const multiSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length < 2) {
    res.status(400).json({
      success: false,
      message: 'Search query is required (min 2 characters)',
    });
    return;
  }

  const results = await searchAllPlatforms(query.trim());

  // Find the best price across all platforms
  const allProducts = [
    ...results.amazon,
    ...results.flipkart,
    ...results.myntra.filter((r) => !r.isSearchLink),
  ].filter((p) => p.price > 0);

  const bestDeal = allProducts.length > 0
    ? allProducts.reduce((best, p) => (p.price < best.price ? p : best))
    : null;

  res.json({
    success: true,
    query: query.trim(),
    results,
    bestDeal,
    totalResults: allProducts.length,
  });
});

module.exports = { multiSearch };
