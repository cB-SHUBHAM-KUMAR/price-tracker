/**
 * @fileoverview Fair Price Calculator — estimates the fair market value
 * using reference price data (when available), category multipliers,
 * brand coefficients, seasonal adjustments, and demand factors.
 * Generates deterministic 30-day historical price estimates.
 */

const { lookupProduct, lookupHotel, lookupFlight } = require('./referencePriceDB');

// ─── Category Base Market Multipliers ────────────────────────────────────────
const CATEGORY_MULTIPLIERS = {
  electronics: 0.92,
  fashion: 0.85,
  home: 0.88,
  books: 0.95,
  grocery: 0.97,
  beauty: 0.87,
  sports: 0.90,
  toys: 0.88,
  default: 0.90,
};

// ─── Brand Premium Coefficients ──────────────────────────────────────────────
const BRAND_COEFFICIENTS = {
  premium: 1.15,   // Apple, Samsung, Nike, etc.
  mid: 1.0,        // Standard brands
  budget: 0.85,    // Generic / lesser-known
  luxury: 1.35,    // Luxury / designer brands
  default: 1.0,
};

// ─── Seasonal Adjustment Factors ─────────────────────────────────────────────
const SEASONAL_FACTORS = {
  sale: 0.80,        // Major sale events (Black Friday, Diwali, etc.)
  holiday: 1.12,     // Holiday surge (Christmas, New Year)
  offSeason: 0.90,   // Low-demand periods
  normal: 1.0,
};

/**
 * Detects current season based on date and product type.
 */
const detectSeason = (type) => {
  const month = new Date().getMonth(); // 0-11

  // Indian festive season: Oct–Nov
  if (month >= 9 && month <= 10) return 'sale';
  // Holiday surge: Dec
  if (month === 11) return 'holiday';
  // Summer travel surge (hotels/flights): Apr–Jun
  if ((type === 'hotel' || type === 'flight') && month >= 3 && month <= 5) return 'holiday';
  // Off-season: Jan–Feb
  if (month <= 1) return 'offSeason';
  return 'normal';
};

/**
 * Classifies a brand name into premium/mid/budget/luxury tier.
 */
const classifyBrand = (brand = '') => {
  const b = brand.toLowerCase().trim();
  const premiumBrands = ['apple', 'samsung', 'sony', 'nike', 'adidas', 'bose', 'dyson', 'dell', 'hp', 'lenovo', 'lg', 'oneplus'];
  const luxuryBrands = ['gucci', 'louis vuitton', 'prada', 'rolex', 'burberry', 'armani', 'versace', 'dior', 'chanel'];
  const budgetBrands = ['boat', 'noise', 'mi', 'redmi', 'realme', 'poco', 'generic', 'local'];

  if (luxuryBrands.some((lb) => b.includes(lb))) return 'luxury';
  if (premiumBrands.some((pb) => b.includes(pb))) return 'premium';
  if (budgetBrands.some((bb) => b.includes(bb))) return 'budget';
  return 'mid';
};

/**
 * Generates deterministic 30-day historical price estimates around the fair price.
 * Uses a simple hash to ensure the same input always produces the same chart.
 */
const generateHistoricalPrices = (basePrice, volatility = 0.08) => {
  const prices = [];
  let current = basePrice;

  for (let i = 0; i < 30; i++) {
    // Deterministic pseudo-random using a sine-based hash
    const hash = Math.sin(basePrice * 0.0001 + i * 2.654) * 10000;
    const noise = (hash - Math.floor(hash) - 0.5) * 2; // -1 to 1
    const change = noise * volatility * basePrice;
    current = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, current + change));
    prices.push(Math.round(current));
  }

  return prices;
};


/**
 * Calculates the fair price range for a given input.
 * Uses reference price database when available for grounded estimation.
 *
 * @param {Object} input - { type, price, currency, metadata }
 * @param {number} demandFactor - Demand multiplier from demandEstimator (0.8 – 1.3)
 * @returns {{ fairPrice, fairPriceRange, historicalPrices, factors, referenceMatch }}
 */
const calculateFairPrice = (input, demandFactor = 1.0) => {
  const { type, price, currency = 'INR', metadata = {} } = input;
  const { brand = '', category = '', title = '', location = '', route = '' } = metadata;

  // 1. Category multiplier
  const catKey = category.toLowerCase().trim() || 'default';
  const categoryMultiplier = CATEGORY_MULTIPLIERS[catKey] || CATEGORY_MULTIPLIERS.default;

  // 2. Brand coefficient
  const brandTier = classifyBrand(brand);
  const brandCoefficient = BRAND_COEFFICIENTS[brandTier];

  // 3. Seasonal adjustment
  const season = detectSeason(type);
  const seasonFactor = SEASONAL_FACTORS[season];

  // 4. Heuristic fair price (original approach)
  const heuristicFairPrice = Math.round(price * categoryMultiplier * (1 / brandCoefficient) * (1 / seasonFactor) * (1 / demandFactor));

  // 5. Reference price lookup
  let referenceMatch = null;
  let referenceFairPrice = null;

  if (type === 'product') {
    const ref = lookupProduct(title, currency);
    if (ref) {
      referenceFairPrice = ref.avgPrice;
      referenceMatch = {
        source: 'product_database',
        matchedKey: ref.matchedKey,
        avgPrice: ref.avgPrice,
        minPrice: ref.minPrice,
        maxPrice: ref.maxPrice,
        confidence: ref.confidence,
      };
    }
  } else if (type === 'hotel') {
    const ref = lookupHotel(location, currency);
    if (ref) {
      // Estimate hotel tier from price
      let tierPrice = ref.mid;
      if (price >= ref.luxury * 0.7) tierPrice = ref.luxury;
      else if (price >= ref.premium * 0.7) tierPrice = ref.premium;
      else if (price <= ref.budget * 1.3) tierPrice = ref.budget;

      referenceFairPrice = tierPrice;
      referenceMatch = {
        source: 'hotel_database',
        matchedLocation: ref.matchedLocation,
        tiers: { budget: ref.budget, mid: ref.mid, premium: ref.premium, luxury: ref.luxury },
        estimatedTierPrice: tierPrice,
        confidence: ref.confidence,
      };
    }
  } else if (type === 'flight') {
    const ref = lookupFlight(route, currency);
    if (ref) {
      referenceFairPrice = ref.avg;
      referenceMatch = {
        source: 'flight_database',
        matchedRoute: ref.matchedRoute,
        budgetFare: ref.budget,
        avgFare: ref.avg,
        premiumFare: ref.premium,
        confidence: ref.confidence,
      };
    }
  }

  // 6. Blend: 70% reference + 30% heuristic (when reference exists)
  let fairPrice;
  if (referenceFairPrice) {
    fairPrice = Math.round(referenceFairPrice * 0.7 + heuristicFairPrice * 0.3);
  } else {
    fairPrice = heuristicFairPrice;
  }

  // 7. Fair range — tighter ±5% when reference data exists, ±8% otherwise
  const buffer = referenceMatch ? 0.05 : 0.08;
  const fairPriceRange = {
    min: Math.round(fairPrice * (1 - buffer)),
    max: Math.round(fairPrice * (1 + buffer)),
  };

  // Override range with reference min/max when available for products
  if (referenceMatch && referenceMatch.source === 'product_database') {
    fairPriceRange.min = Math.min(fairPriceRange.min, referenceMatch.minPrice);
    fairPriceRange.max = Math.max(fairPriceRange.max, referenceMatch.maxPrice);
  }

  // 8. Generate historical price data (deterministic, seeded around fair price)
  const historicalPrices = generateHistoricalPrices(fairPrice);

  return {
    fairPrice,
    fairPriceRange,
    historicalPrices,
    referenceMatch,
    factors: {
      categoryMultiplier,
      brandTier,
      brandCoefficient,
      season,
      seasonFactor,
      demandFactor,
      referenceUsed: !!referenceMatch,
    },
  };
};

module.exports = { calculateFairPrice, classifyBrand, detectSeason, generateHistoricalPrices };

