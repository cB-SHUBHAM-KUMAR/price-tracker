/**
 * @fileoverview Unit tests for Confidence Scorer.
 */

const { calculateConfidence } = require('../../../src/api/v1/services/pricing/confidenceScorer');

describe('Confidence Scorer', () => {
  const baseParams = {
    input: {
      type: 'product',
      price: 10000,
      metadata: { title: 'Test', brand: 'Samsung', category: 'electronics' },
    },
    historicalPrices: Array.from({ length: 30 }, () => 10000), // stable prices
    demandFactor: 1.0,
    fairPrice: 10000,
    currentPrice: 10000,
  };

  it('should return confidenceScore and breakdown', () => {
    const result = calculateConfidence(baseParams);
    expect(result).toHaveProperty('confidenceScore');
    expect(result).toHaveProperty('breakdown');
    expect(result.breakdown).toHaveProperty('dataQuality');
    expect(result.breakdown).toHaveProperty('priceStability');
    expect(result.breakdown).toHaveProperty('demandConfidence');
    expect(result.breakdown).toHaveProperty('varianceControl');
  });

  it('should clamp confidenceScore between 0 and 100', () => {
    const result = calculateConfidence(baseParams);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
  });

  it('should produce higher confidence with more metadata', () => {
    const sparse = calculateConfidence({
      ...baseParams,
      input: { type: 'product', price: 10000, metadata: {} },
    });
    const rich = calculateConfidence({
      ...baseParams,
      input: { type: 'product', price: 10000, metadata: { title: 'X', brand: 'Y', category: 'Z', location: 'A', travelDate: '2026-01-01' } },
    });
    expect(rich.confidenceScore).toBeGreaterThan(sparse.confidenceScore);
  });

  it('should produce lower confidence with volatile historical prices', () => {
    const stableResult = calculateConfidence(baseParams);
    const volatileResult = calculateConfidence({
      ...baseParams,
      historicalPrices: Array.from({ length: 30 }, (_, i) => 5000 + (i % 2 === 0 ? 5000 : -3000)),
    });
    expect(stableResult.confidenceScore).toBeGreaterThan(volatileResult.confidenceScore);
  });

  it('should produce lower confidence with extreme demand factor', () => {
    const normal = calculateConfidence(baseParams);
    const extreme = calculateConfidence({ ...baseParams, demandFactor: 1.3 });
    expect(normal.confidenceScore).toBeGreaterThan(extreme.confidenceScore);
  });

  it('should produce lower confidence when price deviates far from fair', () => {
    const close = calculateConfidence({ ...baseParams, currentPrice: 10000 });
    const far = calculateConfidence({ ...baseParams, currentPrice: 15000 });
    expect(close.confidenceScore).toBeGreaterThan(far.confidenceScore);
  });
});
