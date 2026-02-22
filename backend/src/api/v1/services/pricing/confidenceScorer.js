/**
 * @fileoverview Confidence Scorer — evaluates how confident the system
 * is in its analysis based on data quality, price stability, demand
 * reliability, and variance control.
 *
 * Formula:
 *   confidence = (dataQuality * 0.3) + (priceStability * 0.3)
 *              + (demandConfidence * 0.2) + (varianceControl * 0.2)
 */

/**
 * Calculates a confidence score (0–100) for the price analysis.
 *
 * @param {Object} params
 * @param {Object} params.input - Original user input
 * @param {number[]} params.historicalPrices - 30-day estimated prices
 * @param {number} params.demandFactor
 * @param {number} params.fairPrice
 * @param {number} params.currentPrice
 * @returns {{ confidenceScore, breakdown }}
 */
const calculateConfidence = ({ input, historicalPrices, demandFactor, fairPrice, currentPrice, referenceDataAvailable = false }) => {
  // ─── 1. Data Quality (0–100) ───────────────────────────────────────
  let dataQuality = 40; // base score
  const { metadata = {} } = input;
  if (metadata.title) dataQuality += 10;
  if (metadata.brand) dataQuality += 12;
  if (metadata.category) dataQuality += 12;
  if (metadata.location) dataQuality += 8;
  if (metadata.travelDate) dataQuality += 8;
  if (metadata.route) dataQuality += 8;
  if (input.type) dataQuality += 5;
  if (input.price > 0) dataQuality += 5;
  dataQuality = Math.min(dataQuality, 100);

  // ─── 2. Price Stability (0–100) ────────────────────────────────────
  let priceStability = 80;
  if (historicalPrices.length > 0) {
    const avg = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
    const variance = historicalPrices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / historicalPrices.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avg) * 100;

    // Lower CV = higher stability
    if (coefficientOfVariation < 3) priceStability = 95;
    else if (coefficientOfVariation < 6) priceStability = 85;
    else if (coefficientOfVariation < 10) priceStability = 70;
    else if (coefficientOfVariation < 15) priceStability = 55;
    else priceStability = 40;
  }

  // ─── 3. Demand Confidence (0–100) ──────────────────────────────────
  // More extreme demand factors = less confidence in prediction
  const demandDeviation = Math.abs(demandFactor - 1.0);
  let demandConfidence = 90;
  if (demandDeviation > 0.2) demandConfidence = 55;
  else if (demandDeviation > 0.15) demandConfidence = 65;
  else if (demandDeviation > 0.1) demandConfidence = 75;
  else if (demandDeviation > 0.05) demandConfidence = 85;

  // ─── 4. Variance Control (0–100) ──────────────────────────────────
  // How close is current price to the fair price?
  const priceDeviation = Math.abs(((currentPrice - fairPrice) / fairPrice) * 100);
  let varianceControl = 90;
  if (priceDeviation > 30) varianceControl = 40;
  else if (priceDeviation > 20) varianceControl = 55;
  else if (priceDeviation > 15) varianceControl = 65;
  else if (priceDeviation > 10) varianceControl = 75;
  else if (priceDeviation > 5) varianceControl = 85;

  // ─── 5. Reference Data Bonus ──────────────────────────────────────
  const referenceBonus = referenceDataAvailable ? 10 : 0;

  // ─── Final Score ──────────────────────────────────────────────────
  const rawScore = Math.round(
    dataQuality * 0.3 +
    priceStability * 0.3 +
    demandConfidence * 0.2 +
    varianceControl * 0.2 +
    referenceBonus
  );

  const confidenceScore = Math.min(Math.max(rawScore, 0), 100);

  return {
    confidenceScore,
    breakdown: {
      dataQuality: Math.round(dataQuality),
      priceStability: Math.round(priceStability),
      demandConfidence: Math.round(demandConfidence),
      varianceControl: Math.round(varianceControl),
      ...(referenceDataAvailable && { referenceData: 100 }),
    },
  };
};

module.exports = { calculateConfidence };
