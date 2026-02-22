/**
 * @fileoverview Recommendation Engine — generates buy/wait/monitor
 * recommendations with a human-readable reasoning summary.
 */

/**
 * Generates a recommendation and AI-style reasoning summary.
 *
 * @param {Object} params
 * @param {number} params.currentPrice
 * @param {number} params.fairPrice
 * @param {Object} params.fairPriceRange
 * @param {boolean} params.surgeDetected
 * @param {string} params.surgeLevel
 * @param {number} params.dynamicScore
 * @param {number} params.confidenceScore
 * @param {string} params.demandLevel
 * @param {string[]} params.demandSignals
 * @param {Object} params.factors
 * @returns {{ pricePosition, buyRecommendation, reasoningSummary }}
 */
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const generateRecommendation = ({
  currentPrice,
  fairPrice,
  fairPriceRange,
  surgeDetected,
  surgeLevel,
  dynamicScore,
  confidenceScore,
  demandLevel,
  demandSignals,
  factors,
  currency = 'INR',
}) => {
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  const deviation = ((currentPrice - fairPrice) / fairPrice) * 100;
  const deviationAbs = Math.abs(deviation).toFixed(1);

  // ─── Price Position ────────────────────────────────────────────────
  let pricePosition;
  if (deviation > 15) pricePosition = 'Overpriced';
  else if (deviation > 5) pricePosition = 'Slightly Inflated';
  else if (deviation >= -5) pricePosition = 'Fair';
  else if (deviation >= -15) pricePosition = 'Good Deal';
  else pricePosition = 'Underpriced';

  // ─── Buy Recommendation ───────────────────────────────────────────
  let buyRecommendation;
  if (pricePosition === 'Underpriced') {
    buyRecommendation = 'Buy Immediately — This is well below market value';
  } else if (pricePosition === 'Good Deal') {
    buyRecommendation = 'Buy Now — Good price relative to market';
  } else if (pricePosition === 'Fair') {
    buyRecommendation = 'Buy Now — Price is within expected range';
  } else if (pricePosition === 'Slightly Inflated') {
    buyRecommendation = 'Monitor — Price is slightly above market average. Consider waiting 3–5 days';
  } else {
    buyRecommendation = surgeDetected
      ? 'Wait 5–7 days — Surge pricing detected, prices likely to drop'
      : 'Wait — Currently overpriced. Set a price alert';
  }

  // ─── AI Reasoning Summary ─────────────────────────────────────────
  const lines = [];

  // Price vs. fair value
  if (deviation > 0) {
    lines.push(`Current price is ${deviationAbs}% above the estimated fair market value of ${sym}${fairPrice.toLocaleString()}.`);
  } else if (deviation < -5) {
    lines.push(`Current price is ${deviationAbs}% below the estimated fair market value — this looks like a genuine deal.`);
  } else {
    lines.push(`Current price aligns closely with the estimated fair market value of ${sym}${fairPrice.toLocaleString()}.`);
  }

  // Fair range
  lines.push(`Expected fair price range: ${sym}${fairPriceRange.min.toLocaleString()} – ${sym}${fairPriceRange.max.toLocaleString()}.`);

  // Surge info
  if (surgeDetected) {
    lines.push(`⚠️ Surge pricing detected (level: ${surgeLevel}, dynamic score: ${dynamicScore}). Prices are likely inflated due to ${demandLevel} demand.`);
  }

  // Demand signals
  if (demandSignals.length > 0) {
    lines.push(`Demand signals: ${demandSignals.slice(0, 3).join('; ')}.`);
  }

  // Seasonal context
  if (factors.season !== 'normal') {
    const seasonLabel = factors.season === 'sale' ? 'sale period' : factors.season === 'holiday' ? 'holiday season' : 'off-season';
    lines.push(`Seasonal factor: ${seasonLabel} (${factors.seasonFactor}x multiplier applied).`);
  }

  // Brand context
  if (factors.brandTier !== 'mid') {
    lines.push(`Brand tier: ${factors.brandTier} (coefficient: ${factors.brandCoefficient}x).`);
  }

  // Confidence
  if (confidenceScore >= 80) {
    lines.push(`Analysis confidence: ${confidenceScore}% — High confidence in this assessment.`);
  } else if (confidenceScore >= 60) {
    lines.push(`Analysis confidence: ${confidenceScore}% — Moderate confidence. Results may vary with more data.`);
  } else {
    lines.push(`Analysis confidence: ${confidenceScore}% — Limited data available. Treat as a rough estimate.`);
  }

  // Actionable tip
  if (pricePosition === 'Overpriced' || pricePosition === 'Slightly Inflated') {
    lines.push('💡 Tip: Prices typically drop mid-week and during non-peak hours (early morning).');
  }

  const reasoningSummary = lines.join('\n');

  return { pricePosition, buyRecommendation, reasoningSummary };
};

module.exports = { generateRecommendation };
