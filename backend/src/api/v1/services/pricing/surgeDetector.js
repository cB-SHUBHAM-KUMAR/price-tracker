/**
 * @fileoverview Surge Detector — identifies dynamic / surge pricing
 * by comparing the current price against expected fair value and
 * analyzing price jump patterns in historical estimates.
 */

/**
 * Detects surge pricing conditions.
 *
 * @param {number} currentPrice
 * @param {number} fairPrice
 * @param {number} demandFactor - 0.8 – 1.3
 * @param {number[]} historicalPrices - 30-day estimated prices
 * @returns {{ surgeDetected, dynamicScore, surgeLevel, priceDeviation, jumpDetected }}
 */
const detectSurge = (currentPrice, fairPrice, demandFactor, historicalPrices = []) => {
  // 1. Price deviation from fair value
  const priceDeviation = ((currentPrice - fairPrice) / fairPrice) * 100;

  // 2. Sudden jump detection (compare last 3 days vs 7-day avg)
  let jumpDetected = false;
  let jumpPercentage = 0;
  if (historicalPrices.length >= 7) {
    const last3Avg = historicalPrices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const last7Avg = historicalPrices.slice(-7).reduce((a, b) => a + b, 0) / 7;
    jumpPercentage = ((last3Avg - last7Avg) / last7Avg) * 100;
    jumpDetected = jumpPercentage > 15;
  }

  // 3. Demand-based surge signal
  const highDemand = demandFactor > 1.1;

  // 4. Dynamic pricing score (0 – 1)
  let dynamicScore = 0;
  dynamicScore += Math.min(priceDeviation / 30, 0.4);     // Max 0.4 from deviation
  dynamicScore += jumpDetected ? 0.25 : 0;                 // 0.25 if jump detected
  dynamicScore += highDemand ? 0.2 : 0;                    // 0.2 if high demand
  dynamicScore += Math.min(jumpPercentage / 50, 0.15);     // Max 0.15 from jump %
  dynamicScore = Math.min(Math.max(dynamicScore, 0), 1);   // Clamp 0–1
  dynamicScore = parseFloat(dynamicScore.toFixed(2));

  // 5. Surge level classification
  let surgeLevel = 'none';
  if (dynamicScore >= 0.7) surgeLevel = 'extreme';
  else if (dynamicScore >= 0.5) surgeLevel = 'high';
  else if (dynamicScore >= 0.3) surgeLevel = 'moderate';
  else if (dynamicScore >= 0.15) surgeLevel = 'low';

  // 6. Surge detected flag
  const surgeDetected = currentPrice > fairPrice * 1.10 || (jumpDetected && highDemand);

  return {
    surgeDetected,
    dynamicScore,
    surgeLevel,
    priceDeviation: parseFloat(priceDeviation.toFixed(2)),
    jumpDetected,
    jumpPercentage: parseFloat(jumpPercentage.toFixed(2)),
  };
};

module.exports = { detectSurge };
