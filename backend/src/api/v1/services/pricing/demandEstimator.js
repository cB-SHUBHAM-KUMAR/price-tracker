/**
 * @fileoverview Demand Estimator — calculates a demand factor (0.8 – 1.3)
 * based on category, time-of-week, proximity to travel/event dates,
 * and simulated market demand signals.
 */

/**
 * Estimates demand factor for the given input.
 *
 * @param {Object} input - { type, metadata }
 * @returns {{ demandFactor, demandLevel, signals }}
 */
const estimateDemand = (input) => {
  const { type, metadata = {} } = input;
  const { travelDate, location, category = '' } = metadata;

  let demandFactor = 1.0;
  const signals = [];

  // ─── 1. Day-of-week effect ─────────────────────────────────────────
  const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    demandFactor += 0.08;
    signals.push('Weekend premium detected');
  } else if (dayOfWeek === 5) {
    demandFactor += 0.05;
    signals.push('Friday booking surge');
  }

  // ─── 2. Time-of-day effect ─────────────────────────────────────────
  const hour = new Date().getHours();
  if (hour >= 19 && hour <= 23) {
    demandFactor += 0.04;
    signals.push('Evening browsing peak');
  }

  // ─── 3. Travel date proximity (hotels & flights) ──────────────────
  if ((type === 'hotel' || type === 'flight') && travelDate) {
    const daysUntilTravel = Math.ceil(
      (new Date(travelDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilTravel <= 2) {
      demandFactor += 0.25;
      signals.push('Last-minute booking — extreme demand');
    } else if (daysUntilTravel <= 7) {
      demandFactor += 0.15;
      signals.push('Booking within 7 days — high demand');
    } else if (daysUntilTravel <= 14) {
      demandFactor += 0.08;
      signals.push('Booking within 2 weeks — moderate demand');
    } else if (daysUntilTravel > 30) {
      demandFactor -= 0.05;
      signals.push('Advance booking — lower demand pressure');
    }
  }

  // ─── 4. Location demand hotspots (hotels) ──────────────────────────
  if (type === 'hotel' && location) {
    const hotspots = ['goa', 'mumbai', 'delhi', 'bangalore', 'dubai', 'london', 'new york', 'paris', 'tokyo', 'maldives'];
    if (hotspots.some((h) => location.toLowerCase().includes(h))) {
      demandFactor += 0.06;
      signals.push(`${location} is a high-demand destination`);
    }
  }

  // ─── 5. Category demand for products ───────────────────────────────
  if (type === 'product') {
    const highDemandCategories = ['electronics', 'fashion', 'beauty'];
    if (highDemandCategories.includes(category.toLowerCase())) {
      demandFactor += 0.05;
      signals.push(`${category} is a high-demand category`);
    }
  }

  // ─── 6. Deterministic market activity signal ────────────────────────
  // Hash based on input for reproducibility (same input = same result within the hour)
  const hashSeed = `${type}:${metadata.title || ''}:${metadata.brand || ''}:${new Date().getHours()}`;
  let hash = 0;
  for (let i = 0; i < hashSeed.length; i++) {
    hash = ((hash << 5) - hash) + hashSeed.charCodeAt(i);
    hash |= 0;
  }
  const marketNoise = ((Math.abs(hash) % 100) / 100 - 0.5) * 0.06;
  demandFactor += marketNoise;
  if (marketNoise > 0.02) signals.push('Elevated market activity detected');

  // Clamp to valid range
  demandFactor = parseFloat(Math.min(Math.max(demandFactor, 0.8), 1.3).toFixed(3));

  // Demand level classification
  let demandLevel = 'moderate';
  if (demandFactor >= 1.2) demandLevel = 'very high';
  else if (demandFactor >= 1.1) demandLevel = 'high';
  else if (demandFactor <= 0.9) demandLevel = 'low';

  return { demandFactor, demandLevel, signals };
};

module.exports = { estimateDemand };
