/**
 * @fileoverview Unit tests for Fair Price Calculator.
 */

const { calculateFairPrice, classifyBrand, detectSeason } = require('../../../src/api/v1/services/pricing/fairPriceCalculator');

describe('Fair Price Calculator', () => {
  describe('classifyBrand()', () => {
    it('should classify premium brands', () => {
      expect(classifyBrand('Apple')).toBe('premium');
      expect(classifyBrand('Samsung Galaxy')).toBe('premium');
      expect(classifyBrand('NIKE')).toBe('premium');
    });

    it('should classify luxury brands', () => {
      expect(classifyBrand('Gucci')).toBe('luxury');
      expect(classifyBrand('Louis Vuitton')).toBe('luxury');
    });

    it('should classify budget brands', () => {
      expect(classifyBrand('Boat')).toBe('budget');
      expect(classifyBrand('Redmi Note')).toBe('budget');
    });

    it('should default to mid for unknown brands', () => {
      expect(classifyBrand('UnknownBrand')).toBe('mid');
      expect(classifyBrand('')).toBe('mid');
    });
  });

  describe('calculateFairPrice()', () => {
    const baseInput = {
      type: 'product',
      price: 10000,
      currency: 'INR',
      metadata: { title: 'Test Item', brand: 'Samsung', category: 'electronics' },
    };

    it('should return fairPrice, fairPriceRange, historicalPrices, and factors', () => {
      const result = calculateFairPrice(baseInput, 1.0);
      expect(result).toHaveProperty('fairPrice');
      expect(result).toHaveProperty('fairPriceRange');
      expect(result).toHaveProperty('fairPriceRange.min');
      expect(result).toHaveProperty('fairPriceRange.max');
      expect(result).toHaveProperty('historicalPrices');
      expect(result).toHaveProperty('factors');
      expect(result.historicalPrices).toHaveLength(30);
    });

    it('should produce a fairPrice as a rounded integer', () => {
      const result = calculateFairPrice(baseInput, 1.0);
      expect(Number.isInteger(result.fairPrice)).toBe(true);
    });

    it('should set fair range ±8% from fairPrice', () => {
      const result = calculateFairPrice(baseInput, 1.0);
      const expectedMin = Math.round(result.fairPrice * 0.92);
      const expectedMax = Math.round(result.fairPrice * 1.08);
      expect(result.fairPriceRange.min).toBe(expectedMin);
      expect(result.fairPriceRange.max).toBe(expectedMax);
    });

    it('should include correct brandTier in factors', () => {
      const result = calculateFairPrice(baseInput, 1.0);
      expect(result.factors.brandTier).toBe('premium');
    });

    it('should produce lower fairPrice for premium brands (higher coefficient)', () => {
      const premiumInput = { ...baseInput, metadata: { brand: 'Apple', category: 'electronics' } };
      const budgetInput = { ...baseInput, metadata: { brand: 'Boat', category: 'electronics' } };
      const premiumResult = calculateFairPrice(premiumInput, 1.0);
      const budgetResult = calculateFairPrice(budgetInput, 1.0);
      // Premium brands have higher coefficient so fair price is lower (price / brandCoeff)
      expect(premiumResult.fairPrice).toBeLessThan(budgetResult.fairPrice);
    });

    it('should adjust fairPrice based on demandFactor', () => {
      const lowDemand = calculateFairPrice(baseInput, 0.9);
      const highDemand = calculateFairPrice(baseInput, 1.2);
      // Higher demand => lower fair price (1/demandFactor)
      expect(highDemand.fairPrice).toBeLessThan(lowDemand.fairPrice);
    });

    it('should use default category multiplier for unknown category', () => {
      const input = { ...baseInput, metadata: { brand: '', category: 'unknown' } };
      const result = calculateFairPrice(input, 1.0);
      expect(result.factors.categoryMultiplier).toBe(0.90); // default
    });
  });
});
