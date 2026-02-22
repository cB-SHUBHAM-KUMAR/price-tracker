/**
 * @fileoverview Price routes.
 */

const { Router } = require('express');
const priceController = require('../controllers/price.controller');
const scraperController = require('../controllers/scraper.controller');
const multiPlatformController = require('../controllers/multiPlatform.controller');
const { validate } = require('../../../middlewares/validation.middleware');
const { authenticate, attachUserIfPresent } = require('../../../middlewares/auth.middleware');
const { analyzePriceSchema } = require('../validators/price.validator');

const router = Router();

// POST /api/v1/price/scrape — Scrape product data from URL (public)
router.post('/scrape', scraperController.scrapeURL);

// POST /api/v1/price/multi-search — Search across platforms (public)
router.post('/multi-search', multiPlatformController.multiSearch);

// POST /api/v1/price/analyze — Run price analysis (public)
router.post('/analyze', attachUserIfPresent, validate(analyzePriceSchema), priceController.analyzePrice);

// GET  /api/v1/price/history — Get analysis history (auth required)
router.get('/history', authenticate, priceController.getHistory);

// GET  /api/v1/price/:id — Get specific analysis (auth required)
router.get('/:id', authenticate, priceController.getAnalysisById);

module.exports = router;
