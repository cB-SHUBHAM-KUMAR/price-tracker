/**
 * @fileoverview Unit tests for Surge Detector.
 */

const { detectSurge } = require('../../../src/api/v1/services/pricing/surgeDetector');

describe('Surge Detector', () => {
  const fairPrice = 10000;

  describe('priceDeviation', () => {
    it('should return positive deviation when price > fairPrice', () => {
      const result = detectSurge(12000, fairPrice, 1.0, []);
      expect(result.priceDeviation).toBe(20);
    });

    it('should return negative deviation when price < fairPrice', () => {
      const result = detectSurge(8000, fairPrice, 1.0, []);
      expect(result.priceDeviation).toBe(-20);
    });

    it('should return 0 deviation when price === fairPrice', () => {
      const result = detectSurge(fairPrice, fairPrice, 1.0, []);
      expect(result.priceDeviation).toBe(0);
    });
  });

  describe('surgeDetected', () => {
    it('should detect surge when price is >10% above fair price', () => {
      const result = detectSurge(11500, fairPrice, 1.0, []);
      expect(result.surgeDetected).toBe(true);
    });

    it('should NOT detect surge when price is within 10% of fair price', () => {
      const result = detectSurge(10500, fairPrice, 0.9, []);
      expect(result.surgeDetected).toBe(false);
    });

    it('should detect surge when jump detected AND high demand', () => {
      // Craft historical prices where last 3 are much higher than last 7
      const historical = [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1300, 1400, 1500];
      const result = detectSurge(fairPrice, fairPrice, 1.15, historical);
      expect(result.jumpDetected).toBe(true);
      expect(result.surgeDetected).toBe(true);
    });
  });

  describe('surgeLevel', () => {
    it('should classify "none" for dynamicScore < 0.15', () => {
      const result = detectSurge(fairPrice, fairPrice, 0.9, []);
      expect(result.surgeLevel).toBe('none');
    });

    it('should classify higher levels for overpriced items', () => {
      const result = detectSurge(15000, fairPrice, 1.2, []);
      expect(['low', 'moderate', 'high', 'extreme']).toContain(result.surgeLevel);
    });
  });

  describe('dynamicScore', () => {
    it('should clamp dynamicScore between 0 and 1', () => {
      const result = detectSurge(20000, fairPrice, 1.3, []);
      expect(result.dynamicScore).toBeGreaterThanOrEqual(0);
      expect(result.dynamicScore).toBeLessThanOrEqual(1);
    });

    it('should have higher dynamicScore for bigger deviations', () => {
      const fair = detectSurge(10500, fairPrice, 1.0, []);
      const overpriced = detectSurge(15000, fairPrice, 1.0, []);
      expect(overpriced.dynamicScore).toBeGreaterThan(fair.dynamicScore);
    });
  });
});
