/**
 * @fileoverview Price controller — handles /price endpoints.
 */

const { asyncHandler } = require('../../../utils/asyncHandler');
const ResponseFormatter = require('../../../utils/responseFormatter');
const priceService = require('../services/price.service');
const priceAnalysisRepository = require('../../../repositories/priceAnalysis.repository');
const PriceDTO = require('../dtos/price.dto');
const mongoose = require('mongoose');

const analyzePrice = asyncHandler(async (req, res) => {
  const input = req.body;

  // Run analysis
  const result = await priceService.analyzePrice(input);

  // Persist to DB (non-blocking — don't fail the request)
  try {
    await priceAnalysisRepository.create({
      userId: req.user?.id,
      type: input.type,
      inputPayload: input,
      result: PriceDTO.toStorage(result),
      pricePosition: result.pricePosition,
      confidenceScore: result.confidenceScore,
    });
  } catch (dbError) {
    // Log but don't fail
    const logger = require('../../../config/logger.config');
    logger.warn('Failed to persist analysis', { error: dbError.message });
  }

  // Return formatted response
  ResponseFormatter.success(res, PriceDTO.toResponse(result), 'Price analysis complete');
});

const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const history = await priceAnalysisRepository.findByUser(
    req.user.id,
    { page: parseInt(page, 10), limit: parseInt(limit, 10), sort: '-createdAt' }
  );
  ResponseFormatter.paginated(res, history.data, {
    page: history.page,
    limit: history.limit,
    total: history.total,
  });
});

const getAnalysisById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const { NotFoundError } = require('../../../errors');
    throw new NotFoundError('Analysis');
  }

  const analysis = await priceAnalysisRepository.findByIdForUser(req.params.id, req.user.id);
  if (!analysis) {
    const { NotFoundError } = require('../../../errors');
    throw new NotFoundError('Analysis');
  }

  ResponseFormatter.success(res, analysis);
});

module.exports = { analyzePrice, getHistory, getAnalysisById };
