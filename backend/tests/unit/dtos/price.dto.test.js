const PriceDTO = require('../../../src/api/v1/dtos/price.dto');

describe('PriceDTO', () => {
  it('preserves frontend-required fields in toResponse()', () => {
    const now = new Date().toISOString();
    const result = {
      input: { type: 'product', currentPrice: 999, metadata: { title: 'Phone' } },
      fairPriceRange: { min: 900, max: 1100 },
      currentPrice: 999,
      fairPrice: 1000,
      pricePosition: 'Fair',
      priceDeviation: -0.1,
      surgeDetected: false,
      surgeLevel: 'none',
      dynamicScore: 0.1,
      demandLevel: 'normal',
      demandSignals: ['baseline demand'],
      confidenceScore: 88,
      confidenceBreakdown: { metadataQuality: 90 },
      buyRecommendation: 'Buy',
      reasoningSummary: 'Looks fair',
      historicalPrices: [980, 1000, 1020],
      priceTimeline: { monthLabels: ['Jan'], monthlyTrend: [100] },
      referenceMatch: null,
      aiEnhanced: true,
      analyzedAt: now,
    };

    const dto = PriceDTO.toResponse(result);

    expect(dto.input).toEqual(result.input);
    expect(dto.priceTimeline).toEqual(result.priceTimeline);
    expect(dto.aiEnhanced).toBe(true);
    expect(dto.currentPrice).toBe(999);
    expect(dto.fairPrice).toBe(1000);
  });
});
