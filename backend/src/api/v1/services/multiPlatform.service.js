/**
 * @fileoverview Multi-Platform Search Service — searches for products
 * across Amazon, Flipkart, and Myntra to compare prices.
 * Uses URL construction + scraping for real results.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../../config/logger.config');

const PLATFORMS = {
  amazon: {
    name: 'Amazon',
    logo: '🛒',
    searchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
    domain: 'amazon.in',
  },
  flipkart: {
    name: 'Flipkart',
    logo: '🛍️',
    searchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    domain: 'flipkart.com',
  },
  myntra: {
    name: 'Myntra',
    logo: '👗',
    searchUrl: (q) => `https://www.myntra.com/${encodeURIComponent(q.replace(/\s+/g, '-'))}`,
    domain: 'myntra.com',
  },
};

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
};

/**
 * Tries to scrape search results from Amazon India.
 */
const searchAmazon = async (query) => {
  try {
    const url = PLATFORMS.amazon.searchUrl(query);
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    const results = [];

    $('[data-component-type="s-search-result"]').each((i, el) => {
      if (i >= 5) return;
      const $el = $(el);
      const title = $el.find('h2 span').text().trim();
      const priceText = $el.find('.a-price .a-offscreen').first().text().replace(/[^0-9.]/g, '');
      const image = $el.find('.s-image').attr('src') || '';
      const link = 'https://www.amazon.in' + ($el.find('h2 a').attr('href') || '');
      const rating = $el.find('.a-icon-alt').first().text().trim();

      if (title && priceText) {
        results.push({
          title: title.substring(0, 100),
          price: parseFloat(priceText) || 0,
          currency: 'INR',
          image,
          url: link.substring(0, 300),
          rating,
          platform: 'Amazon',
        });
      }
    });

    return results;
  } catch (err) {
    logger.warn('Amazon search failed', { error: err.message });
    return [];
  }
};

/**
 * Tries to scrape search results from Flipkart.
 */
const searchFlipkart = async (query) => {
  try {
    const url = PLATFORMS.flipkart.searchUrl(query);
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    const results = [];

    // Flipkart uses different selectors for different layouts
    $('a[href*="/p/"]').each((i, el) => {
      if (i >= 5) return;
      const $el = $(el);
      const container = $el.closest('[data-id]').length ? $el.closest('[data-id]') : $el.parent().parent();
      const title = container.find('div[class*="col"] a[title]').attr('title')
        || container.find('a[class*="Title"]').text().trim()
        || $el.attr('title')
        || container.find('div').first().text().trim();
      const priceText = container.find('div[class*="price"], div[class*="Price"]').first().text().replace(/[^0-9]/g, '');
      const image = container.find('img').first().attr('src') || '';
      const link = 'https://www.flipkart.com' + ($el.attr('href') || '');

      if (title && priceText && title.length > 3) {
        results.push({
          title: title.substring(0, 100),
          price: parseFloat(priceText) || 0,
          currency: 'INR',
          image,
          url: link.substring(0, 300),
          rating: '',
          platform: 'Flipkart',
        });
      }
    });

    return results;
  } catch (err) {
    logger.warn('Flipkart search failed', { error: err.message });
    return [];
  }
};

/**
 * Generates Myntra search URL (Myntra blocks scraping heavily, so we provide link only).
 */
const searchMyntra = async (query) => {
  try {
    const searchUrl = `https://www.myntra.com/${query.replace(/\s+/g, '-').toLowerCase()}`;
    // Myntra blocks scraping, so return a search link for the user
    return [{
      title: `Search "${query}" on Myntra`,
      price: 0,
      currency: 'INR',
      image: '',
      url: searchUrl,
      rating: '',
      platform: 'Myntra',
      isSearchLink: true,
    }];
  } catch (err) {
    logger.warn('Myntra search failed', { error: err.message });
    return [];
  }
};

/**
 * Searches across all platforms for a given query.
 * @param {string} query - Product name to search
 * @returns {Object} { amazon: [...], flipkart: [...], myntra: [...] }
 */
const searchAllPlatforms = async (query) => {
  logger.info('Multi-platform search started', { query });

  const [amazon, flipkart, myntra] = await Promise.allSettled([
    searchAmazon(query),
    searchFlipkart(query),
    searchMyntra(query),
  ]);

  const results = {
    amazon: amazon.status === 'fulfilled' ? amazon.value : [],
    flipkart: flipkart.status === 'fulfilled' ? flipkart.value : [],
    myntra: myntra.status === 'fulfilled' ? myntra.value : [],
  };

  const totalResults = results.amazon.length + results.flipkart.length + results.myntra.length;
  logger.info('Multi-platform search complete', {
    query,
    amazon: results.amazon.length,
    flipkart: results.flipkart.length,
    myntra: results.myntra.length,
    total: totalResults,
  });

  return results;
};

module.exports = { searchAllPlatforms, PLATFORMS };
