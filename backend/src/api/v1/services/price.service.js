/**
 * @fileoverview Price Service — orchestrates the full pricing analysis
 * pipeline by calling each engine module in sequence.
 */

const { estimateDemand } = require('./pricing/demandEstimator');
const { calculateFairPrice } = require('./pricing/fairPriceCalculator');
const { detectSurge } = require('./pricing/surgeDetector');
const { calculateConfidence } = require('./pricing/confidenceScorer');
const { generateRecommendation } = require('./pricing/recommendationEngine');
const { generateAIReasoning } = require('./pricing/aiReasoningEngine');
const { getTimeline } = require('./pricing/priceTimeline');
const logger = require('../../../config/logger.config');

class PriceService {
  /**
   * Runs the complete price analysis pipeline.
   * @param {Object} input - { type, price, currency, metadata }
   * @returns {Object} Full analysis result
   */
  async analyzePrice(input) {
    logger.info('Starting price analysis', { type: input.type, price: input.price });

    // 1. Estimate demand
    const demand = estimateDemand(input);
    logger.info('Demand estimation complete', { demandFactor: demand.demandFactor, demandLevel: demand.demandLevel });

    // 2. Calculate fair price
    const fairResult = calculateFairPrice(input, demand.demandFactor);
    logger.info('Fair price calculated', { fairPrice: fairResult.fairPrice, range: fairResult.fairPriceRange });

    // 3. Detect surge
    const surge = detectSurge(
      input.price,
      fairResult.fairPrice,
      demand.demandFactor,
      fairResult.historicalPrices
    );
    logger.info('Surge detection complete', { surgeDetected: surge.surgeDetected, dynamicScore: surge.dynamicScore });

    // 4. Calculate confidence
    const confidence = calculateConfidence({
      input,
      historicalPrices: fairResult.historicalPrices,
      demandFactor: demand.demandFactor,
      fairPrice: fairResult.fairPrice,
      currentPrice: input.price,
      referenceDataAvailable: !!fairResult.referenceMatch,
    });
    logger.info('Confidence scored', { confidenceScore: confidence.confidenceScore });

    // 5. Generate recommendation
    const recommendation = generateRecommendation({
      currentPrice: input.price,
      fairPrice: fairResult.fairPrice,
      fairPriceRange: fairResult.fairPriceRange,
      surgeDetected: surge.surgeDetected,
      surgeLevel: surge.surgeLevel,
      dynamicScore: surge.dynamicScore,
      confidenceScore: confidence.confidenceScore,
      demandLevel: demand.demandLevel,
      demandSignals: demand.signals,
      factors: fairResult.factors,
      currency: input.currency || 'INR',
    });

    // 6. Assemble result (with heuristic summary first)
    const result = {
      input: {
        type: input.type,
        currentPrice: input.price,
        currency: input.currency || 'INR',
        metadata: input.metadata,
      },
      fairPrice: fairResult.fairPrice,
      fairPriceRange: fairResult.fairPriceRange,
      currentPrice: input.price,
      pricePosition: recommendation.pricePosition,
      priceDeviation: surge.priceDeviation,
      surgeDetected: surge.surgeDetected,
      surgeLevel: surge.surgeLevel,
      dynamicScore: surge.dynamicScore,
      demandLevel: demand.demandLevel,
      demandFactor: demand.demandFactor,
      demandSignals: demand.signals,
      confidenceScore: confidence.confidenceScore,
      confidenceBreakdown: confidence.breakdown,
      buyRecommendation: recommendation.buyRecommendation,
      reasoningSummary: recommendation.reasoningSummary,
      historicalPrices: fairResult.historicalPrices,
      referenceMatch: fairResult.referenceMatch || null,
      priceTimeline: getTimeline(input.type, input.metadata?.category),
      analyzedAt: new Date().toISOString(),
    };

    // 7. Enhance reasoning with AI, but cap latency to preserve API response time.
    const aiTimeoutMs = parseInt(process.env.AI_REASONING_TIMEOUT_MS || '5000', 10);
    const timeoutSummary = new Promise((resolve) => {
      setTimeout(() => resolve(recommendation.reasoningSummary), aiTimeoutMs);
    });

    result.reasoningSummary = await Promise.race([
      generateAIReasoning(result, recommendation.reasoningSummary),
      timeoutSummary,
    ]);
    result.aiEnhanced = result.reasoningSummary !== recommendation.reasoningSummary;

    logger.info('Price analysis complete', {
      pricePosition: result.pricePosition,
      recommendation: result.buyRecommendation,
      aiEnhanced: result.aiEnhanced,
    });

    return result;
  }
}

module.exports = new PriceService();

