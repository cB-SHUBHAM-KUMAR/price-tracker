/**
 * @fileoverview Reference Price Database — contains known market prices
 * for common products, hotel rate ranges, and flight fare benchmarks.
 *
 * This data gives the pricing engine an external reference point so the
 * fair price is NOT derived solely from the user's input price.
 *
 * Prices are in INR. The engine applies currency conversion as needed.
 */

// ─── Conversion rates (approximate, for reference-based estimation) ──────────
const CONVERSION_RATES = {
  INR: 1,
  USD: 83,
  EUR: 90,
  GBP: 105,
};

// ─── Product Reference Prices ────────────────────────────────────────────────
// Format: { keyword: { avgPrice, minPrice, maxPrice, category, brandTier } }
const PRODUCT_REFERENCES = {
  // ── Electronics ─────────────────────────────
  'iphone 15':          { avgPrice: 79900,  minPrice: 69900,  maxPrice: 89900,  category: 'electronics', brandTier: 'premium' },
  'iphone 15 pro':      { avgPrice: 134900, minPrice: 119900, maxPrice: 149900, category: 'electronics', brandTier: 'premium' },
  'iphone 15 pro max':  { avgPrice: 159900, minPrice: 144900, maxPrice: 179900, category: 'electronics', brandTier: 'premium' },
  'iphone 14':          { avgPrice: 59900,  minPrice: 49900,  maxPrice: 69900,  category: 'electronics', brandTier: 'premium' },
  'samsung galaxy s24': { avgPrice: 79999,  minPrice: 64999,  maxPrice: 89999,  category: 'electronics', brandTier: 'premium' },
  'samsung galaxy s24 ultra': { avgPrice: 129999, minPrice: 109999, maxPrice: 149999, category: 'electronics', brandTier: 'premium' },
  'samsung galaxy a54': { avgPrice: 32999,  minPrice: 27999,  maxPrice: 38999,  category: 'electronics', brandTier: 'premium' },
  'oneplus 12':         { avgPrice: 64999,  minPrice: 54999,  maxPrice: 72999,  category: 'electronics', brandTier: 'premium' },
  'pixel 8':            { avgPrice: 75999,  minPrice: 59999,  maxPrice: 85999,  category: 'electronics', brandTier: 'premium' },
  'redmi note 13':      { avgPrice: 17999,  minPrice: 13999,  maxPrice: 21999,  category: 'electronics', brandTier: 'budget' },
  'macbook air m2':     { avgPrice: 114900, minPrice: 99900,  maxPrice: 129900, category: 'electronics', brandTier: 'premium' },
  'macbook pro m3':     { avgPrice: 174900, minPrice: 159900, maxPrice: 199900, category: 'electronics', brandTier: 'premium' },
  'ipad air':           { avgPrice: 59900,  minPrice: 49900,  maxPrice: 69900,  category: 'electronics', brandTier: 'premium' },
  'airpods pro':        { avgPrice: 24900,  minPrice: 19900,  maxPrice: 29900,  category: 'electronics', brandTier: 'premium' },
  'sony wh-1000xm5':   { avgPrice: 29990,  minPrice: 22990,  maxPrice: 34990,  category: 'electronics', brandTier: 'premium' },
  'bose qc45':          { avgPrice: 26900,  minPrice: 19900,  maxPrice: 32900,  category: 'electronics', brandTier: 'premium' },
  'lg tv':              { avgPrice: 45000,  minPrice: 25000,  maxPrice: 85000,  category: 'electronics', brandTier: 'premium' },
  'samsung tv':         { avgPrice: 40000,  minPrice: 20000,  maxPrice: 80000,  category: 'electronics', brandTier: 'premium' },
  'ps5':                { avgPrice: 49990,  minPrice: 39990,  maxPrice: 54990,  category: 'electronics', brandTier: 'premium' },
  'xbox series x':      { avgPrice: 49990,  minPrice: 44990,  maxPrice: 54990,  category: 'electronics', brandTier: 'premium' },
  'nintendo switch':    { avgPrice: 29999,  minPrice: 24999,  maxPrice: 34999,  category: 'electronics', brandTier: 'premium' },
  'dyson v15':          { avgPrice: 52900,  minPrice: 42900,  maxPrice: 62900,  category: 'electronics', brandTier: 'premium' },
  'kindle':             { avgPrice: 9999,   minPrice: 7999,   maxPrice: 14999,  category: 'electronics', brandTier: 'premium' },

  // ── Fashion ─────────────────────────────────
  'nike air max':       { avgPrice: 12995,  minPrice: 8495,   maxPrice: 16995,  category: 'fashion', brandTier: 'premium' },
  'nike air jordan':    { avgPrice: 16995,  minPrice: 12995,  maxPrice: 22995,  category: 'fashion', brandTier: 'premium' },
  'adidas ultraboost':  { avgPrice: 15999,  minPrice: 11999,  maxPrice: 19999,  category: 'fashion', brandTier: 'premium' },
  'levi jeans':         { avgPrice: 3499,   minPrice: 1999,   maxPrice: 5999,   category: 'fashion', brandTier: 'mid' },
  'ray-ban aviator':    { avgPrice: 8490,   minPrice: 5990,   maxPrice: 12990,  category: 'fashion', brandTier: 'premium' },

  // ── Beauty ──────────────────────────────────
  'dyson airwrap':      { avgPrice: 44900,  minPrice: 34900,  maxPrice: 54900,  category: 'beauty', brandTier: 'premium' },
  'mac lipstick':       { avgPrice: 1850,   minPrice: 1250,   maxPrice: 2450,   category: 'beauty', brandTier: 'premium' },

  // ── Home ────────────────────────────────────
  'irobot roomba':      { avgPrice: 29999,  minPrice: 19999,  maxPrice: 45999,  category: 'home', brandTier: 'premium' },
  'instant pot':        { avgPrice: 7999,   minPrice: 4999,   maxPrice: 12999,  category: 'home', brandTier: 'mid' },
};

// ─── Hotel Reference Rates (per night, INR) ──────────────────────────────────
const HOTEL_REFERENCES = {
  'goa':       { budget: 2500,  mid: 6000,  premium: 15000, luxury: 35000 },
  'mumbai':    { budget: 3000,  mid: 7000,  premium: 18000, luxury: 45000 },
  'delhi':     { budget: 2500,  mid: 6000,  premium: 15000, luxury: 40000 },
  'bangalore': { budget: 2000,  mid: 5000,  premium: 12000, luxury: 30000 },
  'jaipur':    { budget: 1500,  mid: 4000,  premium: 10000, luxury: 25000 },
  'chennai':   { budget: 2000,  mid: 5000,  premium: 12000, luxury: 28000 },
  'kolkata':   { budget: 1500,  mid: 4000,  premium: 10000, luxury: 22000 },
  'hyderabad': { budget: 2000,  mid: 5000,  premium: 12000, luxury: 28000 },
  'dubai':     { budget: 8000,  mid: 15000, premium: 35000, luxury: 80000 },
  'london':    { budget: 12000, mid: 20000, premium: 45000, luxury: 100000 },
  'new york':  { budget: 10000, mid: 18000, premium: 40000, luxury: 90000 },
  'paris':     { budget: 10000, mid: 18000, premium: 40000, luxury: 85000 },
  'tokyo':     { budget: 6000,  mid: 12000, premium: 30000, luxury: 65000 },
  'maldives':  { budget: 15000, mid: 30000, premium: 60000, luxury: 150000 },
  'bangkok':   { budget: 2000,  mid: 5000,  premium: 12000, luxury: 30000 },
  'singapore': { budget: 6000,  mid: 12000, premium: 28000, luxury: 60000 },
};

// ─── Flight Reference Fares (INR, one-way economy) ──────────────────────────
const FLIGHT_REFERENCES = {
  // Domestic India
  'del-bom':  { budget: 3500,  avg: 5500,  premium: 9000 },
  'del-blr':  { budget: 4000,  avg: 6500,  premium: 10000 },
  'bom-blr':  { budget: 3000,  avg: 5000,  premium: 8000 },
  'del-ccu':  { budget: 3500,  avg: 5500,  premium: 9000 },
  'del-maa':  { budget: 4000,  avg: 6000,  premium: 10000 },
  'bom-goi':  { budget: 2500,  avg: 4000,  premium: 7000 },
  'del-goi':  { budget: 4000,  avg: 6000,  premium: 10000 },
  // International
  'del-dxb':  { budget: 10000, avg: 18000, premium: 30000 },
  'bom-dxb':  { budget: 8000,  avg: 15000, premium: 25000 },
  'del-lhr':  { budget: 30000, avg: 50000, premium: 85000 },
  'del-jfk':  { budget: 40000, avg: 65000, premium: 110000 },
  'bom-sin':  { budget: 12000, avg: 22000, premium: 40000 },
  'del-bkk':  { budget: 10000, avg: 18000, premium: 32000 },
};

/**
 * Looks up a product reference by fuzzy-matching the title.
 * Returns null if no match found.
 *
 * @param {string} title - Product name / title
 * @param {string} currency - Currency code (INR, USD, etc.)
 * @returns {Object|null} { avgPrice, minPrice, maxPrice, matchedKey, confidence }
 */
const lookupProduct = (title, currency = 'INR') => {
  if (!title) return null;
  const t = title.toLowerCase().trim();
  const rate = CONVERSION_RATES[currency] || 1;

  let bestMatch = null;
  let bestScore = 0;

  for (const [key, ref] of Object.entries(PRODUCT_REFERENCES)) {
    // Check if the title contains the reference key
    if (t.includes(key)) {
      const score = key.length; // Longer match = more specific
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...ref, matchedKey: key };
      }
    }
  }

  if (!bestMatch) return null;

  // Convert to target currency
  return {
    avgPrice: Math.round(bestMatch.avgPrice / rate),
    minPrice: Math.round(bestMatch.minPrice / rate),
    maxPrice: Math.round(bestMatch.maxPrice / rate),
    matchedKey: bestMatch.matchedKey,
    category: bestMatch.category,
    brandTier: bestMatch.brandTier,
    confidence: 0.85, // Reference data match confidence
  };
};

/**
 * Looks up hotel reference rates by location.
 *
 * @param {string} location
 * @param {string} currency
 * @returns {Object|null} { budget, mid, premium, luxury, matchedLocation }
 */
const lookupHotel = (location, currency = 'INR') => {
  if (!location) return null;
  const loc = location.toLowerCase().trim();
  const rate = CONVERSION_RATES[currency] || 1;

  for (const [key, ref] of Object.entries(HOTEL_REFERENCES)) {
    if (loc.includes(key)) {
      return {
        budget: Math.round(ref.budget / rate),
        mid: Math.round(ref.mid / rate),
        premium: Math.round(ref.premium / rate),
        luxury: Math.round(ref.luxury / rate),
        matchedLocation: key,
        confidence: 0.75,
      };
    }
  }
  return null;
};

/**
 * Looks up flight reference fares by route.
 *
 * @param {string} route - e.g. "DEL → BOM" or "del-bom"
 * @param {string} currency
 * @returns {Object|null} { budget, avg, premium, matchedRoute }
 */
const lookupFlight = (route, currency = 'INR') => {
  if (!route) return null;
  // Normalize: "DEL → BOM" -> "del-bom", "Delhi to Mumbai" -> try city codes
  const r = route.toLowerCase().replace(/[→\->]/g, '-').replace(/\s+/g, '').trim();
  const rate = CONVERSION_RATES[currency] || 1;

  // Direct match
  for (const [key, ref] of Object.entries(FLIGHT_REFERENCES)) {
    if (r.includes(key) || r === key) {
      return {
        budget: Math.round(ref.budget / rate),
        avg: Math.round(ref.avg / rate),
        premium: Math.round(ref.premium / rate),
        matchedRoute: key.toUpperCase(),
        confidence: 0.80,
      };
    }
  }

  // Try reverse route (BOM-DEL matches DEL-BOM)
  const parts = r.split('-').filter(Boolean);
  if (parts.length === 2) {
    const reversed = `${parts[1]}-${parts[0]}`;
    for (const [key, ref] of Object.entries(FLIGHT_REFERENCES)) {
      if (reversed === key) {
        return {
          budget: Math.round(ref.budget / rate),
          avg: Math.round(ref.avg / rate),
          premium: Math.round(ref.premium / rate),
          matchedRoute: key.toUpperCase(),
          confidence: 0.80,
        };
      }
    }
  }

  return null;
};

module.exports = {
  PRODUCT_REFERENCES,
  HOTEL_REFERENCES,
  FLIGHT_REFERENCES,
  CONVERSION_RATES,
  lookupProduct,
  lookupHotel,
  lookupFlight,
};
