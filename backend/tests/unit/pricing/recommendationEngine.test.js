/**
 * @fileoverview Unit tests for Recommendation Engine.
 */

const { generateRecommendation } = require('../../../src/api/v1/services/pricing/recommendationEngine');

describe('Recommendation Engine', () => {
  const baseParams = {
    currentPrice: 10000,
    fairPrice: 10000,
    fairPriceRange: { min: 9200, max: 10800 },
    surgeDetected: false,
    surgeLevel: 'none',
    dynamicScore: 0,
    confidenceScore: 85,
    demandLevel: 'moderate',
    demandSignals: [],
    factors: { season: 'normal', seasonFactor: 1.0, brandTier: 'mid', brandCoefficient: 1.0 },
  };

  it('should return pricePosition, buyRecommendation, and reasoningSummary', () => {
    const result = generateRecommendation(baseParams);
    expect(result).toHaveProperty('pricePosition');
    expect(result).toHaveProperty('buyRecommendation');
    expect(result).toHaveProperty('reasoningSummary');
  });

  describe('pricePosition', () => {
    it('should classify "Fair" when deviation is within ±5%', () => {
      const result = generateRecommendation(baseParams);
      expect(result.pricePosition).toBe('Fair');
    });

    it('should classify "Overpriced" when deviation > 15%', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 12000 });
      expect(result.pricePosition).toBe('Overpriced');
    });

    it('should classify "Good Deal" when deviation is -5% to -15%', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 9000 });
      expect(result.pricePosition).toBe('Good Deal');
    });

    it('should classify "Underpriced" when deviation < -15%', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 8000 });
      expect(result.pricePosition).toBe('Underpriced');
    });

    it('should classify "Slightly Inflated" when deviation is 5–15%', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 11000 });
      expect(result.pricePosition).toBe('Slightly Inflated');
    });
  });

  describe('buyRecommendation', () => {
    it('should recommend "Buy Immediately" for Underpriced items', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 8000 });
      expect(result.buyRecommendation).toContain('Buy Immediately');
    });

    it('should recommend "Wait" for Overpriced with surge', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 15000, surgeDetected: true });
      expect(result.buyRecommendation).toContain('Wait');
    });

    it('should recommend "Monitor" for Slightly Inflated', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 11000 });
      expect(result.buyRecommendation).toContain('Monitor');
    });
  });

  describe('reasoningSummary', () => {
    it('should include surge info when surge is detected', () => {
      const result = generateRecommendation({ ...baseParams, surgeDetected: true, surgeLevel: 'high', dynamicScore: 0.6, demandLevel: 'high' });
      expect(result.reasoningSummary).toContain('Surge pricing detected');
    });

    it('should include seasonal context when season is not normal', () => {
      const result = generateRecommendation({ ...baseParams, factors: { ...baseParams.factors, season: 'sale', seasonFactor: 0.8 } });
      expect(result.reasoningSummary).toContain('sale period');
    });

    it('should include brand context for non-mid brands', () => {
      const result = generateRecommendation({ ...baseParams, factors: { ...baseParams.factors, brandTier: 'premium', brandCoefficient: 1.15 } });
      expect(result.reasoningSummary).toContain('premium');
    });

    it('should include confidence level label', () => {
      const result = generateRecommendation(baseParams);
      expect(result.reasoningSummary).toContain('85%');
    });

    it('should include tip for overpriced items', () => {
      const result = generateRecommendation({ ...baseParams, currentPrice: 15000 });
      expect(result.reasoningSummary).toContain('Tip');
    });
  });
});
