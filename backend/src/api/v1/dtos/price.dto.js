/**
 * @fileoverview Price DTO — shapes the analysis result for API response
 * and for database storage.
 */

class PriceDTO {
  /**
   * Shapes the result for the API response (client-facing).
   */
  static toResponse(result) {
    return {
      input: result.input,
      fairPriceRange: result.fairPriceRange,
      currentPrice: result.currentPrice,
      fairPrice: result.fairPrice,
      pricePosition: result.pricePosition,
      priceDeviation: result.priceDeviation,
      surgeDetected: result.surgeDetected,
      surgeLevel: result.surgeLevel,
      dynamicScore: result.dynamicScore,
      demandLevel: result.demandLevel,
      demandSignals: result.demandSignals,
      confidenceScore: result.confidenceScore,
      confidenceBreakdown: result.confidenceBreakdown,
      buyRecommendation: result.buyRecommendation,
      reasoningSummary: result.reasoningSummary,
      historicalPrices: result.historicalPrices,
      priceTimeline: result.priceTimeline,
      referenceMatch: result.referenceMatch || null,
      aiEnhanced: result.aiEnhanced || false,
      analyzedAt: result.analyzedAt,
    };
  }

  /**
   * Shapes data for database storage (removes heavy arrays, keeps summary).
   */
  static toStorage(result) {
    return {
      fairPrice: result.fairPrice,
      fairPriceRange: result.fairPriceRange,
      currentPrice: result.currentPrice,
      pricePosition: result.pricePosition,
      priceDeviation: result.priceDeviation,
      surgeDetected: result.surgeDetected,
      dynamicScore: result.dynamicScore,
      confidenceScore: result.confidenceScore,
      buyRecommendation: result.buyRecommendation,
      reasoningSummary: result.reasoningSummary,
      analyzedAt: result.analyzedAt,
    };
  }
}

module.exports = PriceDTO;
