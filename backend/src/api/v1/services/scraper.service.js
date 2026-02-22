/**
 * @fileoverview URL Scraper Service — extracts product info (title, price,
 * brand, category, image) from e-commerce URLs.
 *
 * Strategy:
 * 1. Attempt direct HTTP fetch (works for many sites)
 * 2. Parse HTML with cheerio for known selectors + JSON-LD + OG tags
 * 3. If extraction fails, use OpenAI to intelligently parse whatever
 *    content we got (partial HTML, page titles, URL patterns)
 *
 * Supported platforms: Amazon.in, Flipkart, Myntra + generic fallback
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../../config/logger.config');

// ─── HTTP fetch with browser-like headers ────────────────────────────────────
const fetchHTML = async (url) => {
  // Try multiple user-agent strategies
  const strategies = [
    {
      // Google bot UA — many sites serve full content to Googlebot
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    {
      // Standard browser UA
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
    {
      // Curl-like UA — sometimes simpler is better
      'User-Agent': 'curl/7.88.1',
      'Accept': '*/*',
    },
  ];

  for (const headers of strategies) {
    try {
      const response = await axios.get(url, {
        headers,
        timeout: 12000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      // Check if we got usable content (not a captcha page)
      const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const isCaptcha = html.toLowerCase().includes('captcha') || html.toLowerCase().includes('robot');
      const isBlocked = response.status === 403 || response.status === 429;

      if (!isBlocked && !isCaptcha && html.length > 1000) {
        logger.info('HTML fetch successful', { strategy: headers['User-Agent'].substring(0, 30), length: html.length });
        return html;
      }

      logger.warn('Strategy returned blocked/captcha content', { strategy: headers['User-Agent'].substring(0, 30), status: response.status });
    } catch (error) {
      logger.warn('Strategy failed', { strategy: headers['User-Agent'].substring(0, 30), error: error.message });
    }
  }

  // All strategies failed — return null, we'll use OpenAI with just the URL
  return null;
};

/**
 * Detects which e-commerce platform a URL belongs to.
 */
const detectPlatform = (url) => {
  const u = url.toLowerCase();
  if (u.includes('amazon.in') || u.includes('amazon.com')) return 'amazon';
  if (u.includes('flipkart.com')) return 'flipkart';
  if (u.includes('myntra.com')) return 'myntra';
  return 'generic';
};

// ─── HTML-based extraction (for when fetch succeeds) ─────────────────────────
const extractFromHTML = ($, platform) => {
  let title = '', priceText = '', brand = '', category = '', image = '', rating = '';

  // ─── JSON-LD (most reliable, works across all sites) ────────────
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      let data = JSON.parse($(el).html());
      // Handle @graph arrays
      if (data['@graph']) data = data['@graph'].find((d) => d['@type'] === 'Product') || data;
      if (data['@type'] === 'Product' || data.name) {
        title = title || data.name || '';
        brand = brand || data.brand?.name || (typeof data.brand === 'string' ? data.brand : '') || '';
        image = image || (Array.isArray(data.image) ? data.image[0] : data.image) || '';
        if (data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          priceText = priceText || offer.price?.toString() || offer.lowPrice?.toString() || '';
        }
        category = category || data.category || '';
        if (data.aggregateRating) {
          rating = `${data.aggregateRating.ratingValue}/5`;
        }
      }
    } catch { /* ignore parse errors */ }
  });

  // ─── OG Tags (fallback) ─────────────────────────────────────────
  if (!title) title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || '';
  if (!image) image = $('meta[property="og:image"]').attr('content') || '';
  if (!priceText) priceText = $('meta[property="product:price:amount"]').attr('content') || '';

  // ─── Platform-specific selectors ────────────────────────────────
  if (platform === 'amazon') {
    if (!title) title = $('#productTitle').text().trim();
    if (!priceText) priceText = $('span.a-price-whole').first().text().trim() || $('span.a-offscreen').first().text().trim();
    if (!brand) brand = $('#bylineInfo').text().replace(/Visit the |Store|Brand:/gi, '').trim();
    if (!image) image = $('#landingImage').attr('src') || '';
    const breadcrumbs = [];
    $('#wayfinding-breadcrumbs_container li span.a-list-item a').each((_, el) => breadcrumbs.push($(el).text().trim()));
    if (!category) category = breadcrumbs[breadcrumbs.length - 1] || '';
  }

  if (platform === 'flipkart') {
    if (!title) title = $('span.VU-ZEz, span.B_NuCI, h1.yhB1nd span, h1._9E25nV').first().text().trim();
    if (!priceText) priceText = $('div.Nx9bqj.CxhGGd, div._30jeq3._16Jk6d, div.Nx9bqj, div._30jeq3').first().text().trim();
    if (!brand) brand = $('span.mEh187, span.G6XhRU').first().text().trim();
    if (!image) image = $('img._396cs4, img.DByuf4').first().attr('src') || '';
  }

  if (platform === 'myntra') {
    if (!title) title = $('h1.pdp-title, h1.pdp-name').first().text().trim();
    if (!brand) brand = $('h1.pdp-title').first().text().trim();
    if (!priceText) priceText = $('span.pdp-price strong').first().text().trim();
    if (!category) category = 'fashion';
  }

  return { title, priceText, brand, category, image, rating };
};

// ─── OpenAI Extraction (when HTML fails / is blocked) ────────────────────────
const extractWithOpenAI = async (url, partialHTML = '') => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Could not scrape the page and OpenAI is not configured. Please enter details manually.');
  }

  // Build context from whatever we have
  let context = `URL: ${url}\n`;
  if (partialHTML) {
    // Extract useful text from partial HTML (title, meta tags, any visible text)
    const $ = cheerio.load(partialHTML);
    const pageTitle = $('title').text().trim();
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const h1 = $('h1').first().text().trim();

    context += `Page Title: ${pageTitle}\n`;
    if (ogTitle) context += `OG Title: ${ogTitle}\n`;
    if (ogDesc) context += `OG Description: ${ogDesc}\n`;
    if (ogImage) context += `OG Image: ${ogImage}\n`;
    if (h1) context += `H1: ${h1}\n`;
  }

  logger.info('Using OpenAI for URL extraction', { url });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a product data extraction assistant. Given a URL and optional page metadata, extract product information. You must respond with ONLY valid JSON, no markdown.

Response format:
{"title":"product name","price":number_or_null,"currency":"INR","brand":"brand name","category":"electronics|fashion|beauty|home|sports|books|grocery|toys","image":"image_url_or_empty","platform":"site name"}

Rules:
- Infer product info from the URL structure (e.g. /apple-iphone-15-blue-128-gb/ tells you it's an Apple iPhone 15 Blue 128GB)
- price should be a number (no symbols), or null if unknown
- currency defaults to INR for .in domains, USD for .com
- Infer brand and category from the product name
- platform should be the website name (Amazon, Flipkart, Myntra, etc.)
- For image, use the OG image if available, otherwise empty string`,
          },
          {
            role: 'user',
            content: context,
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const content = response.data.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty OpenAI response');

    // Parse JSON (handle potential markdown wrapping)
    const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      title: parsed.title || '',
      priceText: parsed.price?.toString() || '',
      brand: parsed.brand || '',
      category: parsed.category || '',
      image: parsed.image || '',
      rating: '',
      platform: parsed.platform || 'Web',
      price: parsed.price || null,
      currency: parsed.currency || 'INR',
    };
  } catch (error) {
    logger.error('OpenAI extraction failed', { error: error.message });
    throw error; // Rethrow to let the caller handle it (e.g., try Gemini)
  }
};

// ─── Gemini Extraction (Alternative fallback) ───────────────────────────
const extractWithGemini = async (url, partialHTML = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  // Build context
  let context = `URL: ${url}\n`;
  if (partialHTML) {
    const $ = cheerio.load(partialHTML);
    context += `Page Title: ${$('title').text().trim()}\n`;
    context += `H1: ${$('h1').first().text().trim()}\n`;
  }

  logger.info('Using Gemini for URL extraction', { url });

  const prompt = `You are a product data extraction assistant. Given a URL and optional page metadata, extract product information. You must respond with ONLY valid JSON, no markdown.

Response format:
{"title":"product name","price":number_or_null,"currency":"INR","brand":"brand name","category":"electronics|fashion|beauty|home|sports|books|grocery|toys","image":"image_url_or_empty","platform":"site name"}

Rules:
- Infer product info from the URL structure (e.g. /apple-iphone-15-blue-128-gb/ suggests an Apple iPhone 15 Blue 128GB)
- price should be a number (no symbols), or null if unknown
- currency defaults to INR for .in domains, USD for .com
- Infer brand and category from the product name
- platform should be the website name (Amazon, Flipkart, Myntra, etc.)

Context:
${context}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) throw new Error('Empty Gemini response');

    const parsed = JSON.parse(content);

    return {
      title: parsed.title || '',
      priceText: parsed.price?.toString() || '',
      brand: parsed.brand || '',
      category: parsed.category || '',
      image: parsed.image || '',
      rating: '',
      platform: parsed.platform || 'Web',
      price: parsed.price || null,
      currency: parsed.currency || 'INR',
    };
  } catch (error) {
    logger.error('Gemini extraction failed', { error: error.response?.data?.error?.message || error.message });
    throw new Error('Could not extract product data via Gemini.');
  }
};

// ─── Price Cleaning ──────────────────────────────────────────────────────────
const cleanPrice = (priceText) => {
  if (!priceText) return null;
  const cleaned = priceText
    .replace(/[₹$€£]/g, '')
    .replace(/Rs\.?/gi, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .replace(/\.00$/, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const detectCurrency = (priceText, url) => {
  if (!priceText) return 'INR';
  if (priceText.includes('$')) return 'USD';
  if (priceText.includes('€')) return 'EUR';
  if (priceText.includes('£')) return 'GBP';
  if (url.includes('.com') && !url.includes('.in')) return 'USD';
  return 'INR';
};

const detectCategory = (title, rawCategory) => {
  const text = `${title} ${rawCategory}`.toLowerCase();
  const categoryMap = {
    electronics: ['phone', 'laptop', 'tablet', 'headphone', 'earphone', 'earbud', 'speaker', 'tv', 'television', 'camera', 'watch', 'smartwatch', 'charger', 'monitor', 'keyboard', 'mouse', 'console', 'gaming', 'iphone', 'samsung', 'pixel', 'macbook', 'ipad', 'airpod', 'kindle'],
    fashion: ['shirt', 'jeans', 'dress', 'shoes', 'sneaker', 'jacket', 'hoodie', 'kurta', 'saree', 'lehenga', 't-shirt', 'trouser', 'skirt', 'blazer', 'sandal', 'heel', 'boot', 'slipper'],
    beauty: ['lipstick', 'foundation', 'cream', 'serum', 'shampoo', 'conditioner', 'perfume', 'fragrance', 'sunscreen', 'moisturizer', 'makeup', 'mascara', 'concealer'],
    home: ['sofa', 'table', 'chair', 'bed', 'mattress', 'pillow', 'curtain', 'lamp', 'rug', 'kitchen', 'mixer', 'blender', 'appliance', 'vacuum'],
    sports: ['cricket', 'football', 'badminton', 'yoga', 'gym', 'fitness', 'running', 'cycling', 'dumbbell', 'treadmill'],
  };
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((kw) => text.includes(kw))) return cat;
  }
  return rawCategory || '';
};

// ─── URL Pattern Extraction (guaranteed fallback, no HTTP needed) ────────────
/**
 * Extracts product info directly from the URL structure.
 * Works because e-commerce sites encode product names in their URL slugs:
 *   Amazon:   /Product-Name-Here/dp/ASIN
 *   Flipkart: /product-name-here/p/itemid
 *   Myntra:   /brand/product-name/id
 */
const extractFromURL = (url) => {
  const platform = detectPlatform(url);
  const parsed = new URL(url);
  const pathParts = parsed.pathname.split('/').filter(Boolean);

  let slug = '';
  let brand = '';

  if (platform === 'amazon') {
    // Amazon URL: /Product-Name-With-Dashes/dp/B0XXXXX  OR  /dp/B0XXXXX
    const dpIndex = pathParts.indexOf('dp');
    if (dpIndex > 0) {
      slug = pathParts[dpIndex - 1]; // The part before /dp/ is the product name
    } else if (pathParts.length > 0) {
      // No /dp/ pattern — use the longest path segment
      slug = pathParts.reduce((a, b) => a.length > b.length ? a : b, '');
    }
  } else if (platform === 'flipkart') {
    // Flipkart URL: /product-name-here/p/itmXXXX
    const pIndex = pathParts.indexOf('p');
    if (pIndex > 0) {
      slug = pathParts[pIndex - 1];
    } else if (pathParts.length > 0) {
      slug = pathParts[0];
    }
  } else if (platform === 'myntra') {
    // Myntra URL: /brand/product-name/id OR /brand/product-name/buy
    if (pathParts.length >= 2) {
      brand = pathParts[0].replace(/-/g, ' ');
      slug = pathParts[1];
    } else if (pathParts.length === 1) {
      slug = pathParts[0];
    }
  } else {
    // Generic — use the longest path segment
    slug = pathParts.reduce((a, b) => a.length > b.length ? a : b, '');
  }

  // Convert slug to readable title: "apple-iphone-15-blue-128-gb" → "Apple Iphone 15 Blue 128 Gb"
  const title = slug
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  // Try to extract brand from first word of title
  if (!brand && title) {
    const words = title.split(' ');
    const knownBrands = ['apple', 'samsung', 'sony', 'lg', 'hp', 'dell', 'asus', 'lenovo', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme', 'oppo', 'vivo', 'nokia', 'motorola', 'google', 'pixel', 'titan', 'casio', 'fossil', 'nike', 'adidas', 'puma', 'reebok', 'levis', 'zara', 'boat', 'jbl', 'bose', 'philips', 'panasonic', 'whirlpool', 'bosch', 'bajaj', 'prestige', 'havells', 'crompton'];
    const firstWord = words[0].toLowerCase();
    if (knownBrands.includes(firstWord)) {
      brand = words[0];
    }
  }

  const category = detectCategory(title, '');
  const currency = url.includes('.in') ? 'INR' : 'USD';
  const platformName = platform === 'amazon' ? 'Amazon' : platform === 'flipkart' ? 'Flipkart' : platform === 'myntra' ? 'Myntra' : 'Web';

  return {
    title: title || 'Unknown Product',
    price: 0, // Can't get price from URL alone
    currency,
    brand: brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '',
    category,
    image: '',
    rating: '',
    platform: platformName,
    url,
    urlExtracted: true,
  };
};

/**
 * Main scraping function — entry point.
 *
 * Strategy:
 * 1. Try HTTP fetch → parse HTML (works for non-protected sites)
 * 2. If HTML extraction fails → try OpenAI (works with valid API key)
 * 3. If all fail → extract from URL pattern (always works, no price)
 */
const scrapeProductURL = async (url) => {
  const platform = detectPlatform(url);
  logger.info('Scraping URL', { url, platform });

  // Step 1: Try fetching HTML
  const html = await fetchHTML(url);

  // Step 2: Try HTML-based extraction if we got content
  if (html) {
    const $ = cheerio.load(html);
    const extracted = extractFromHTML($, platform);

    // Filter out error/garbage page titles
    const junkTitles = ['page not found', '404', 'access denied', 'robot', 'captcha', 'recaptcha', 'blocked', 'forbidden', 'error', 'unavailable', 'sorry'];
    const titleLower = (extracted.title || '').toLowerCase();
    const isJunkTitle = junkTitles.some((junk) => titleLower.includes(junk));

    if ((extracted.title && !isJunkTitle) || extracted.priceText) {
      const price = cleanPrice(extracted.priceText);
      const currency = detectCurrency(extracted.priceText, url);
      const category = detectCategory(extracted.title, extracted.category);
      const brand = extracted.brand?.replace(/Visit the |Store$|'s /gi, '').trim() || '';

      const scraped = {
        title: extracted.title || 'Unknown Product',
        price: price || 0,
        currency,
        brand,
        category,
        image: extracted.image || '',
        rating: extracted.rating || '',
        platform: platform === 'amazon' ? 'Amazon' : platform === 'flipkart' ? 'Flipkart' : platform === 'myntra' ? 'Myntra' : 'Web',
        url,
      };

      logger.info('HTML extraction successful', { title: scraped.title, price: scraped.price });
      return scraped;
    }
  }

  // Step 3: Try OpenAI fallback
  try {
    logger.info('HTML extraction failed, trying OpenAI', { url });
    const aiResult = await extractWithOpenAI(url, html);
    const price = aiResult.price || cleanPrice(aiResult.priceText);
    const currency = aiResult.currency || detectCurrency(aiResult.priceText, url);
    const category = detectCategory(aiResult.title, aiResult.category);

    logger.info('OpenAI extraction successful', { title: aiResult.title });
    return {
      title: aiResult.title || 'Unknown Product',
      price: price || 0,
      currency,
      brand: aiResult.brand || '',
      category,
      image: aiResult.image || '',
      rating: '',
      platform: aiResult.platform || 'Web',
      url,
      aiExtracted: true,
    };
  } catch (aiError) {
    logger.warn('OpenAI fallback failed, trying Gemini', { error: aiError.message });
    
    // Step 3.5: Try Gemini fallback
    try {
      const geminiResult = await extractWithGemini(url, html);
      const price = geminiResult.price || cleanPrice(geminiResult.priceText);
      const currency = geminiResult.currency || detectCurrency(geminiResult.priceText, url);
      const category = detectCategory(geminiResult.title, geminiResult.category);

      logger.info('Gemini extraction successful', { title: geminiResult.title });
      return {
        title: geminiResult.title || 'Unknown Product',
        price: price || 0,
        currency,
        brand: geminiResult.brand || '',
        category,
        image: geminiResult.image || '',
        rating: '',
        platform: geminiResult.platform || 'Web',
        url,
        aiExtracted: true,
      };
    } catch (geminiError) {
      logger.warn('Gemini fallback failed, using URL extraction', { error: geminiError.message });
    }
  }

  // Step 4: Final fallback — extract from URL pattern (always works)
  logger.info('Using URL pattern extraction', { url });
  return extractFromURL(url);
};

module.exports = { scrapeProductURL, detectPlatform };

