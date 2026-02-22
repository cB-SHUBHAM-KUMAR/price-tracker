/**
 * @fileoverview Alert scheduler - periodically checks active alerts
 * against trackable market prices and triggers notifications.
 */

const logger = require('../config/logger.config');
const { PriceAlert } = require('../models');
const notificationService = require('../services/notification.service');
const { scrapeProductURL } = require('../api/v1/services/scraper.service');
const { calculateFairPrice } = require('../api/v1/services/pricing/fairPriceCalculator');
const { estimateDemand } = require('../api/v1/services/pricing/demandEstimator');
const { detectSurge } = require('../api/v1/services/pricing/surgeDetector');
const { calculateConfidence } = require('../api/v1/services/pricing/confidenceScorer');
const { generateRecommendation } = require('../api/v1/services/pricing/recommendationEngine');

const CHECK_INTERVAL_MS = parseInt(process.env.ALERT_CHECK_INTERVAL_MS, 10) || 30 * 60 * 1000;
const EQUALS_TOLERANCE = parseFloat(process.env.ALERT_EQUALS_TOLERANCE || '0.5');

let intervalId = null;

const analyzePrice = (input) => {
  const { demandFactor, demandLevel, signals } = estimateDemand(input);
  const { fairPrice, fairPriceRange, historicalPrices, factors } = calculateFairPrice(input, demandFactor);
  const surge = detectSurge(input.price, fairPrice, demandFactor, historicalPrices);
  const confidence = calculateConfidence({
    input,
    historicalPrices,
    demandFactor,
    fairPrice,
    currentPrice: input.price,
  });

  const recommendation = generateRecommendation({
    currentPrice: input.price,
    fairPrice,
    fairPriceRange,
    surgeDetected: surge.surgeDetected,
    surgeLevel: surge.surgeLevel,
    dynamicScore: surge.dynamicScore,
    confidenceScore: confidence.confidenceScore,
    demandLevel,
    demandSignals: signals,
    factors,
    currency: input.currency || 'INR',
  });

  return {
    currentPrice: input.price,
    fairPrice,
    fairPriceRange,
    pricePosition: recommendation.pricePosition,
    buyRecommendation: recommendation.buyRecommendation,
    priceDeviation: surge.priceDeviation,
    surgeDetected: surge.surgeDetected,
    confidenceScore: confidence.confidenceScore,
  };
};

const scrapeCurrentPrice = async (alert) => {
  if (!alert.trackingUrl) return null;

  try {
    const scraped = await scrapeProductURL(alert.trackingUrl);
    if (scraped && scraped.price > 0) {
      logger.info('Scraped current price for alert', {
        alertId: alert._id,
        title: alert.title,
        price: scraped.price,
      });
      return scraped.price;
    }
  } catch (error) {
    logger.warn('Failed to scrape current price', {
      alertId: alert._id,
      title: alert.title,
      error: error.message,
    });
  }

  return null;
};

const isConditionMet = (alert, currentPrice) => {
  if (alert.condition === 'below') return currentPrice <= alert.targetPrice;
  if (alert.condition === 'above') return currentPrice >= alert.targetPrice;
  if (alert.condition === 'equals') return Math.abs(currentPrice - alert.targetPrice) <= EQUALS_TOLERANCE;
  return false;
};

const checkAlerts = async () => {
  try {
    const activeAlerts = await PriceAlert.find({ status: 'active' })
      .populate('userId', 'email name')
      .lean();

    if (activeAlerts.length === 0) {
      logger.debug('No active alerts to check');
      return;
    }

    logger.info('Running alert check cycle', { activeCount: activeAlerts.length });

    for (const alert of activeAlerts) {
      try {
        const currentPrice = await scrapeCurrentPrice(alert);

        if (currentPrice == null) {
          await PriceAlert.findByIdAndUpdate(alert._id, { lastCheckedAt: new Date() });
          logger.debug('Skipped alert without price source', {
            alertId: alert._id,
            hasTrackingUrl: !!alert.trackingUrl,
          });
          continue;
        }

        const input = {
          type: alert.type,
          price: currentPrice,
          currency: alert.currency || 'INR',
          metadata: {
            ...(alert.metadata || {}),
            title: alert.title,
          },
        };

        const result = analyzePrice(input);

        const updateFields = {
          lastCheckedPrice: currentPrice,
          lastCheckedAt: new Date(),
        };

        if (isConditionMet(alert, currentPrice)) {
          const delivery = await notificationService.send(alert, result);
          if (delivery?.delivered) {
            updateFields.status = 'triggered';
            updateFields.triggeredAt = new Date();

            logger.info('Alert triggered', {
              alertId: alert._id,
              title: alert.title,
              currentPrice,
              targetPrice: alert.targetPrice,
              condition: alert.condition,
            });
          } else {
            logger.warn('Alert condition met but notification not delivered', {
              alertId: alert._id,
              title: alert.title,
              reason: delivery?.reason || 'unknown',
            });
          }
        }

        await PriceAlert.findByIdAndUpdate(alert._id, {
          ...updateFields,
          $push: {
            priceHistory: {
              $each: [{ price: currentPrice, checkedAt: new Date() }],
              $slice: -30,
            },
          },
        });
      } catch (error) {
        logger.error('Error while checking alert', {
          alertId: alert._id,
          error: error.message,
        });
      }
    }
  } catch (error) {
    logger.error('Alert check cycle failed', { error: error.message });
  }
};

const start = () => {
  if (intervalId) {
    logger.warn('Alert scheduler already running');
    return;
  }

  logger.info('Alert scheduler started', { intervalMs: CHECK_INTERVAL_MS });
  checkAlerts();
  intervalId = setInterval(checkAlerts, CHECK_INTERVAL_MS);
};

const stop = () => {
  if (!intervalId) return;

  clearInterval(intervalId);
  intervalId = null;
  logger.info('Alert scheduler stopped');
};

module.exports = {
  start,
  stop,
  checkAlerts,
  _private: {
    analyzePrice,
    scrapeCurrentPrice,
    isConditionMet,
  },
};
