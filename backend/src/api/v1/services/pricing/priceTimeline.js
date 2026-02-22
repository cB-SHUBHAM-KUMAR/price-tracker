/**
 * @fileoverview Price Timeline — curated "best time to buy" data
 * showing seasonal price trends and tips by product category.
 */

// Monthly price index: 100 = average, <100 = cheaper, >100 = more expensive
const CATEGORY_TIMELINES = {
  electronics: {
    monthlyTrend: [85, 95, 100, 100, 105, 88, 95, 100, 105, 80, 100, 110],
    bestMonths: ['January', 'June', 'October'],
    peakMonths: ['December', 'September'],
    tips: [
      'Republic Day & New Year sales in January offer the deepest discounts',
      'Flipkart Big Billion Days (Oct) and Amazon Great Indian Festival are peak deal seasons',
      'Mid-year sales in June often clear out older models at 20-30% off',
      'Avoid buying in December — prices peak due to holiday demand',
      'New phone launches in Sep/Oct push older model prices down significantly',
    ],
  },
  fashion: {
    monthlyTrend: [80, 90, 100, 100, 95, 100, 78, 90, 95, 85, 100, 105],
    bestMonths: ['January', 'July', 'October'],
    peakMonths: ['December', 'November'],
    tips: [
      'End-of-season sales in January (winter) and July (summer) offer 40-70% off',
      'Myntra Big Fashion Festival in October has site-wide discounts',
      'Festival season (Diwali/Dussehra) brings ethnic wear deals',
      'Off-season buying (winter clothes in summer) saves 30-50%',
      'Weekday flash sales often have better deals than weekend ones',
    ],
  },
  beauty: {
    monthlyTrend: [90, 95, 100, 100, 95, 100, 90, 95, 100, 85, 100, 105],
    bestMonths: ['January', 'July', 'October'],
    peakMonths: ['December', 'November'],
    tips: [
      'Nykaa Pink Friday Sale offers up to 50% off on premium brands',
      'Beauty products rarely expire fast — stock up during sales',
      'International brands go on sale during Amazon Prime Day (July)',
      'Combo packs during festive season offer better per-unit value',
    ],
  },
  home: {
    monthlyTrend: [85, 90, 100, 95, 100, 95, 90, 100, 105, 80, 95, 100],
    bestMonths: ['January', 'July', 'October'],
    peakMonths: ['September', 'December'],
    tips: [
      'Republic Day sales in January feature home appliance discounts',
      'Amazon and Flipkart festive sales (Oct) are best for large appliances',
      'Furniture is cheapest during mid-year clearance sales',
      'Smart home devices often get bundled deals during tech sales',
    ],
  },
  sports: {
    monthlyTrend: [85, 95, 100, 100, 95, 105, 90, 95, 100, 85, 100, 105],
    bestMonths: ['January', 'July', 'October'],
    peakMonths: ['June', 'December'],
    tips: [
      'Fitness gear prices spike in January/June (resolution seasons)',
      'End-of-season sports equipment clearance in July is ideal',
      'Look for cricket/IPL gear deals during the IPL off-season (Nov-Feb)',
      'Running shoes get New Year sale discounts of 20-40%',
    ],
  },
  grocery: {
    monthlyTrend: [95, 100, 100, 105, 105, 100, 95, 95, 100, 100, 100, 100],
    bestMonths: ['January', 'July', 'August'],
    peakMonths: ['April', 'May'],
    tips: [
      'Summer months (Apr-May) see vegetable and staple price spikes',
      'Post-monsoon harvest (Jul-Aug) brings prices down for grains and produce',
      'Buy staples and dry goods in bulk during festive sales',
      'Subscription models (BigBasket, Blinkit) offer consistent pricing',
    ],
  },
  books: {
    monthlyTrend: [90, 95, 100, 95, 100, 100, 90, 100, 100, 85, 100, 100],
    bestMonths: ['January', 'July', 'October'],
    peakMonths: ['August', 'September'],
    tips: [
      'Amazon Kindle deals during Great Indian Festival (Oct) offer 30-50% off',
      'Academic books are cheapest in Jan/Jul (between school terms)',
      'E-book versions are typically 30-60% cheaper than physical copies',
      'World Book Day (April 23) sometimes features flash deals',
    ],
  },
  toys: {
    monthlyTrend: [80, 90, 100, 100, 100, 95, 90, 95, 100, 90, 105, 115],
    bestMonths: ['January', 'July'],
    peakMonths: ['November', 'December'],
    tips: [
      'Post-Christmas (January) is the cheapest time for toys',
      'Prices peak 30-50% in Nov-Dec due to holiday and gift demand',
      'Mid-year clearance in July offers good deals on older toy lines',
      'Birthday month deals from toy stores can save 10-20%',
    ],
  },
};

// Flight timeline is route/season-dependent
const FLIGHT_TIMELINE = {
  monthlyTrend: [90, 85, 95, 100, 110, 105, 115, 110, 95, 85, 90, 120],
  bestMonths: ['February', 'October', 'September'],
  peakMonths: ['July', 'December', 'May'],
  tips: [
    'Book domestic flights 4-6 weeks ahead for best prices',
    'Tuesday and Wednesday departures are typically 15-20% cheaper',
    'Avoid peak holiday periods (Diwali, Christmas, summer vacation)',
    'Red-eye and early morning flights can be 20-40% cheaper',
    'Use fare alerts to track price drops on specific routes',
    'Return flights booked together are cheaper than two one-way tickets',
  ],
};

// Hotel timeline is location/season-dependent
const HOTEL_TIMELINE = {
  monthlyTrend: [80, 85, 90, 95, 100, 105, 115, 110, 90, 90, 95, 110],
  bestMonths: ['January', 'February', 'September'],
  peakMonths: ['July', 'August', 'December'],
  tips: [
    'Weekday stays (Mon-Thu) are 20-40% cheaper than weekends',
    'Off-season travel to popular destinations saves 30-50%',
    'Book 2-3 weeks ahead for best hotel rates',
    'Last-minute deals (same day) can offer deep discounts on unsold rooms',
    'Loyalty programs and direct booking often beat OTA prices',
    'Hill stations are cheapest Oct-Feb; beaches are cheapest Apr-Jun',
  ],
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns the "best time to buy" timeline for a given type/category.
 * @param {string} type - 'product', 'hotel', or 'flight'
 * @param {string} [category] - Product category (electronics, fashion, etc.)
 * @returns {Object} { monthlyTrend, bestMonths, peakMonths, tips, monthLabels }
 */
const getTimeline = (type, category = '') => {
  let timeline;

  if (type === 'flight') {
    timeline = FLIGHT_TIMELINE;
  } else if (type === 'hotel') {
    timeline = HOTEL_TIMELINE;
  } else {
    const normalizedCategory = (category || 'electronics').toLowerCase();
    timeline = CATEGORY_TIMELINES[normalizedCategory] || CATEGORY_TIMELINES.electronics;
  }

  return {
    monthLabels: MONTH_LABELS,
    monthlyTrend: timeline.monthlyTrend,
    bestMonths: timeline.bestMonths,
    peakMonths: timeline.peakMonths,
    tips: timeline.tips,
  };
};

module.exports = { getTimeline };
