/**
 * @fileoverview Scraper controller - handles URL scraping requests.
 */

const { scrapeProductURL } = require('../services/scraper.service');
const { asyncHandler } = require('../../../utils/asyncHandler');
const ResponseFormatter = require('../../../utils/responseFormatter');

/**
 * POST /api/v1/price/scrape
 * Scrapes product info from an e-commerce URL.
 */
const scrapeURL = asyncHandler(async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return ResponseFormatter.error(res, 'Please provide a valid URL', 400);
  }

  try {
    new URL(url);
  } catch {
    return ResponseFormatter.error(res, 'Invalid URL format', 400);
  }

  try {
    const scrapedData = await scrapeProductURL(url);
    return ResponseFormatter.success(res, scrapedData, 'Product data extracted successfully');
  } catch (error) {
    return ResponseFormatter.error(
      res,
      error.message || 'Failed to extract product data from the URL',
      422
    );
  }
});

module.exports = { scrapeURL };
