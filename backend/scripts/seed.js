/**
 * @fileoverview Database seeder script — run via `npm run seed`.
 * Seeds users, sample price analyses, and price alerts.
 */

const { connectDatabase, disconnectDatabase } = require('../src/database');
const { User, PriceAnalysis, PriceAlert } = require('../src/models');
const logger = require('../src/config/logger.config');

const SAMPLE_ANALYSES = [
  {
    type: 'product',
    inputPayload: { type: 'product', price: 79999, currency: 'INR', metadata: { title: 'iPhone 15 Pro', brand: 'Apple', category: 'electronics' } },
    result: { currentPrice: 79999, fairPrice: 72000, fairPriceRange: { min: 66240, max: 77760 }, pricePosition: 'Slightly Inflated', priceDeviation: 11.1, surgeDetected: false, confidenceScore: 82, buyRecommendation: 'Monitor' },
    pricePosition: 'Slightly Inflated',
    confidenceScore: 82,
  },
  {
    type: 'product',
    inputPayload: { type: 'product', price: 1499, currency: 'INR', metadata: { title: 'boAt Rockerz 450', brand: 'Boat', category: 'electronics' } },
    result: { currentPrice: 1499, fairPrice: 1800, fairPriceRange: { min: 1656, max: 1944 }, pricePosition: 'Good Deal', priceDeviation: -16.7, surgeDetected: false, confidenceScore: 75, buyRecommendation: 'Buy Now' },
    pricePosition: 'Good Deal',
    confidenceScore: 75,
  },
  {
    type: 'hotel',
    inputPayload: { type: 'hotel', price: 8500, currency: 'INR', metadata: { title: 'Taj Hotel Goa', brand: 'Taj', location: 'Goa', travelDate: '2026-03-15' } },
    result: { currentPrice: 8500, fairPrice: 7200, fairPriceRange: { min: 6624, max: 7776 }, pricePosition: 'Overpriced', priceDeviation: 18.1, surgeDetected: true, confidenceScore: 70, buyRecommendation: 'Wait' },
    pricePosition: 'Overpriced',
    confidenceScore: 70,
  },
  {
    type: 'flight',
    inputPayload: { type: 'flight', price: 5200, currency: 'INR', metadata: { title: 'DEL → BOM', brand: 'IndiGo', route: 'DEL-BOM', travelDate: '2026-03-10' } },
    result: { currentPrice: 5200, fairPrice: 5000, fairPriceRange: { min: 4600, max: 5400 }, pricePosition: 'Fair', priceDeviation: 4.0, surgeDetected: false, confidenceScore: 88, buyRecommendation: 'Buy Now' },
    pricePosition: 'Fair',
    confidenceScore: 88,
  },
  {
    type: 'product',
    inputPayload: { type: 'product', price: 45000, currency: 'INR', metadata: { title: 'Nike Air Jordan 1 Retro', brand: 'Nike', category: 'fashion' } },
    result: { currentPrice: 45000, fairPrice: 52000, fairPriceRange: { min: 47840, max: 56160 }, pricePosition: 'Underpriced', priceDeviation: -13.5, surgeDetected: false, confidenceScore: 79, buyRecommendation: 'Buy Immediately' },
    pricePosition: 'Underpriced',
    confidenceScore: 79,
  },
];

const SAMPLE_ALERTS = [
  { title: 'iPhone 15 Pro Price Drop', type: 'product', targetPrice: 72000, currency: 'INR', condition: 'below', metadata: { brand: 'Apple' }, status: 'active' },
  { title: 'Goa Hotel Deal', type: 'hotel', targetPrice: 5000, currency: 'INR', condition: 'below', metadata: { brand: 'Taj' }, status: 'active' },
  { title: 'DEL-BOM Flight Surge Alert', type: 'flight', targetPrice: 8000, currency: 'INR', condition: 'above', status: 'active' },
  { title: 'Gaming Laptop Under 60K', type: 'product', targetPrice: 60000, currency: 'INR', condition: 'below', metadata: { brand: 'ASUS' }, status: 'paused' },
];

const seedData = async () => {
  try {
    await connectDatabase();
    logger.info('Starting database seed...');

    if (process.env.NODE_ENV !== 'production') {
      await User.deleteMany({});
      await PriceAnalysis.deleteMany({});
      await PriceAlert.deleteMany({});
      logger.info('Cleared existing data');
    }

    // Seed users
    const users = [
      { name: 'Admin', email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
      { name: 'Test User', email: 'user@example.com', password: 'User1234!', role: 'user' },
    ];
    await User.create(users);
    logger.info(`Seeded ${users.length} users`);

    // Seed price analyses
    await PriceAnalysis.insertMany(SAMPLE_ANALYSES);
    logger.info(`Seeded ${SAMPLE_ANALYSES.length} price analyses`);

    // Seed alerts
    await PriceAlert.insertMany(SAMPLE_ALERTS);
    logger.info(`Seeded ${SAMPLE_ALERTS.length} price alerts`);

    await disconnectDatabase();
    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', { error: error.message });
    process.exit(1);
  }
};

seedData();
