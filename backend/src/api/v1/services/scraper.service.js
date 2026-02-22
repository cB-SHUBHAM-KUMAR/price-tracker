/**
 * URL scraper service for product metadata extraction.
 *
 * Pipeline:
 * 1. Try multiple direct HTTP fetch strategies.
 * 2. Parse with platform-aware selectors and score candidates.
 * 3. Optionally parse text mirror fallback.
 * 4. AI fallback: OpenAI -> Gemini.
 * 5. URL-pattern fallback as last resort.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../../config/logger.config');

const REQUEST_TIMEOUT_MS = 12000;
const AI_TIMEOUT_MS = 15000;
const MIRROR_TIMEOUT_MS = 12000;

const PLATFORM_LABELS = {
  amazon: 'Amazon',
  flipkart: 'Flipkart',
  myntra: 'Myntra',
  generic: 'Web',
};

const FETCH_STRATEGIES = [
  {
    name: 'googlebot',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },
  {
    name: 'desktop-chrome',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
    },
  },
  {
    name: 'mobile-safari',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },
  {
    name: 'curl',
    headers: {
      'User-Agent': 'curl/8.5.0',
      Accept: '*/*',
    },
  },
];

const BLOCK_PATTERNS = [
  'recaptcha',
  'captcha',
  'access denied',
  'forbidden',
  'bot verification',
  'automated access to amazon data',
  'enter the characters you see below',
  'flipkart recaptcha',
];

const UNAVAILABLE_PATTERNS = [
  'currently unavailable',
  "we don't know when or if this item will be back in stock",
  'temporarily out of stock',
  'out of stock',
  'unavailable',
  'sold out',
];

const JUNK_TITLE_PATTERNS = [
  'page not found',
  '404',
  'access denied',
  'recaptcha',
  'captcha',
  'forbidden',
  'robot check',
  'error',
  'unavailable',
];

const BRAND_HINTS = [
  'apple', 'samsung', 'sony', 'lg', 'hp', 'dell', 'asus', 'lenovo', 'oneplus', 'xiaomi', 'redmi',
  'poco', 'realme', 'oppo', 'vivo', 'nokia', 'motorola', 'google', 'pixel', 'titan', 'casio',
  'fossil', 'nike', 'adidas', 'puma', 'reebok', 'levis', 'zara', 'boat', 'jbl', 'bose', 'philips',
  'panasonic', 'whirlpool', 'bosch', 'bajaj', 'prestige', 'havells', 'crompton',
];

const safeText = (value) => (value == null ? '' : String(value).trim());

const normalizeWhitespace = (value) => safeText(value).replace(/\s+/g, ' ');

const getPlatformLabel = (platform) => PLATFORM_LABELS[platform] || 'Web';

const detectPlatform = (url) => {
  const lower = safeText(url).toLowerCase();
  if (lower.includes('amazon.in') || lower.includes('amazon.com')) return 'amazon';
  if (lower.includes('flipkart.com')) return 'flipkart';
  if (lower.includes('myntra.com')) return 'myntra';
  return 'generic';
};

const cleanPrice = (priceText) => {
  if (priceText == null) return null;

  const normalized = safeText(priceText)
    .replace(/[\u00A0\s]+/g, ' ')
    .replace(/,/g, '')
    .replace(/(INR|USD|EUR|GBP|Rs\.?|MRP|M\.R\.P\.|Our Price|Deal Price|Price)/gi, ' ');

  const matches = normalized.match(/\d{1,9}(?:\.\d{1,2})?/g);
  if (!matches || !matches.length) return null;

  for (const token of matches) {
    const parsed = Number.parseFloat(token);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

const detectCurrency = (priceText, url) => {
  const source = `${safeText(priceText)} ${safeText(url)}`.toLowerCase();

  if (/₹|\u20b9|\binr\b|\brs\.?\b/i.test(source)) return 'INR';
  if (/€|\u20ac|\beur\b/i.test(source)) return 'EUR';
  if (/£|\u00a3|\bgbp\b/i.test(source)) return 'GBP';
  if (/\$|\busd\b/i.test(source)) return 'USD';

  return source.includes('.in') ? 'INR' : 'USD';
};

const detectCategory = (title, rawCategory) => {
  const text = `${safeText(title)} ${safeText(rawCategory)}`.toLowerCase();
  const categoryMap = {
    electronics: [
      'phone', 'laptop', 'tablet', 'headphone', 'earphone', 'earbud', 'speaker', 'tv', 'television',
      'camera', 'watch', 'smartwatch', 'charger', 'monitor', 'keyboard', 'mouse', 'console', 'gaming',
      'iphone', 'samsung', 'pixel', 'macbook', 'ipad', 'airpod', 'kindle',
    ],
    fashion: [
      'shirt', 'jeans', 'dress', 'shoes', 'sneaker', 'jacket', 'hoodie', 'kurta', 'saree', 'lehenga',
      't-shirt', 'trouser', 'skirt', 'blazer', 'sandal', 'heel', 'boot', 'slipper',
    ],
    beauty: [
      'lipstick', 'foundation', 'cream', 'serum', 'shampoo', 'conditioner', 'perfume', 'fragrance',
      'sunscreen', 'moisturizer', 'makeup', 'mascara', 'concealer',
    ],
    home: [
      'sofa', 'table', 'chair', 'bed', 'mattress', 'pillow', 'curtain', 'lamp', 'rug', 'kitchen',
      'mixer', 'blender', 'appliance', 'vacuum',
    ],
    sports: ['cricket', 'football', 'badminton', 'yoga', 'gym', 'fitness', 'running', 'cycling', 'dumbbell', 'treadmill'],
    books: ['book', 'novel', 'hardcover', 'paperback', 'kindle edition'],
    grocery: ['grocery', 'snack', 'tea', 'coffee', 'oil', 'rice', 'flour'],
    toys: ['toy', 'lego', 'puzzle', 'board game', 'doll'],
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return safeText(rawCategory);
};

const isJunkTitle = (title) => {
  const lower = safeText(title).toLowerCase();
  if (!lower) return true;
  return JUNK_TITLE_PATTERNS.some((pattern) => lower.includes(pattern));
};

const isLikelyUnavailable = (text) => {
  const lower = safeText(text).toLowerCase();
  if (!lower) return false;
  return UNAVAILABLE_PATTERNS.some((pattern) => lower.includes(pattern));
};

const isLikelyBlockedPage = (html, status) => {
  if (!safeText(html)) return true;

  if (status === 403 || status === 429) return true;

  const lower = html.toLowerCase();
  return BLOCK_PATTERNS.some((pattern) => lower.includes(pattern));
};

const firstText = ($, selectors = []) => {
  for (const selector of selectors) {
    const text = normalizeWhitespace($(selector).first().text());
    if (text) return text;
  }
  return '';
};

const firstAttr = ($, selectors = [], attr = 'content') => {
  for (const selector of selectors) {
    const value = normalizeWhitespace($(selector).first().attr(attr));
    if (value) return value;
  }
  return '';
};

const parseJsonMaybe = (raw) => {
  if (!safeText(raw)) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const walkProductNode = (node) => {
  if (!node) return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = walkProductNode(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof node !== 'object') return null;

  const type = safeText(node['@type']).toLowerCase();
  if (type === 'product' || safeText(node.name)) {
    return node;
  }

  if (node['@graph']) return walkProductNode(node['@graph']);

  for (const value of Object.values(node)) {
    if (typeof value === 'object') {
      const found = walkProductNode(value);
      if (found) return found;
    }
  }

  return null;
};

const extractFromJsonLd = ($) => {
  let title = '';
  let brand = '';
  let category = '';
  let image = '';
  let rating = '';
  let priceText = '';

  $('script[type="application/ld+json"]').each((_, script) => {
    if (title && priceText && brand && image) return;

    const raw = $(script).html();
    const parsed = parseJsonMaybe(raw);
    if (!parsed) return;

    const product = walkProductNode(parsed);
    if (!product) return;

    title = title || safeText(product.name);

    const brandValue = typeof product.brand === 'string'
      ? product.brand
      : product.brand && typeof product.brand === 'object'
        ? product.brand.name
        : '';
    brand = brand || safeText(brandValue);

    const imageValue = Array.isArray(product.image) ? product.image[0] : product.image;
    image = image || safeText(imageValue);
    category = category || safeText(product.category);

    const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
    if (offers && typeof offers === 'object') {
      priceText = priceText || safeText(offers.price || offers.lowPrice || offers.highPrice || offers.priceSpecification?.price);
    }

    if (product.aggregateRating && typeof product.aggregateRating === 'object') {
      const value = safeText(product.aggregateRating.ratingValue);
      rating = rating || (value ? `${value}/5` : '');
    }
  });

  return { title, brand, category, image, rating, priceText };
};

const extractAmazonPriceText = ($, rawHTML) => {
  const selectorPrice = firstText($, [
    '#tp_price_block_total_price_ww .a-offscreen',
    '#corePrice_feature_div .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#priceblock_saleprice',
    '#buybox .a-price .a-offscreen',
    '#attach-base-product-price',
  ]);

  if (selectorPrice) return selectorPrice;

  const valuePrice = firstAttr($, ['#attach-base-product-price', 'input[name="offeringID.1"]'], 'value');
  if (valuePrice) return valuePrice;

  const regexes = [
    /id="tp_price_block_total_price_ww"[\s\S]{0,4000}?a-offscreen">([^<]+)/i,
    /"displayPrice"\s*:\s*"([^"]+)"/i,
    /"priceToPay"\s*:\s*\{[^}]*"amount"\s*:\s*([0-9.]+)/i,
  ];

  for (const pattern of regexes) {
    const match = rawHTML.match(pattern);
    if (match && safeText(match[1])) return safeText(match[1]);
  }

  return '';
};

const extractFlipkartPriceText = ($, rawHTML) => {
  const selectorPrice = firstText($, [
    'div.Nx9bqj.CxhGGd',
    'div._30jeq3._16Jk6d',
    'div.Nx9bqj',
    'div._30jeq3',
    'span[data-testid="price"]',
    '[class*="price"] [class*="Nx9bqj"]',
  ]);

  if (selectorPrice) return selectorPrice;

  const match = rawHTML.match(/"sellingPrice"\s*:\s*\{[^}]*"amount"\s*:\s*([0-9.]+)/i);
  return match ? safeText(match[1]) : '';
};

const extractMyntraPriceText = ($, rawHTML) => {
  const selectorPrice = firstText($, [
    'span.pdp-price strong',
    '.pdp-discount-container .pdp-price strong',
    '[class*="pdp-price"] strong',
    '[class*="price"] [class*="discounted"]',
  ]);

  if (selectorPrice) return selectorPrice;

  const match = rawHTML.match(/"discountedPrice"\s*:\s*([0-9.]+)/i);
  return match ? safeText(match[1]) : '';
};

const extractGenericPriceText = ($, rawHTML) => {
  const selectorPrice = firstText($, [
    'meta[property="product:price:amount"]',
    'meta[itemprop="price"]',
    '[itemprop="price"]',
    '.price',
    '[class*="price"]',
  ]);

  if (selectorPrice) return selectorPrice;

  const match = rawHTML.match(/(?:₹|\$|€|£|INR|USD|EUR|GBP|Rs\.?)\s?[0-9][0-9,]*(?:\.[0-9]{1,2})?/i);
  return match ? safeText(match[0]) : '';
};

const extractAvailabilityText = ($, rawHTML) => {
  const fromSelectors = firstText($, [
    '#availability',
    '#availabilityInsideBuyBox_feature_div',
    '#outOfStock',
    '.delivery-message',
  ]);

  if (fromSelectors) return fromSelectors;

  const lower = rawHTML.toLowerCase();
  for (const pattern of UNAVAILABLE_PATTERNS) {
    if (lower.includes(pattern)) return pattern;
  }

  return '';
};

const normalizeBrand = (brand) =>
  safeText(brand)
    .replace(/visit the\s+/gi, '')
    .replace(/\s+store$/i, '')
    .replace(/^brand:\s*/i, '')
    .trim();

const extractFromHTML = ($, platform, rawHTML, url) => {
  const jsonLd = extractFromJsonLd($);

  let title = jsonLd.title || firstText($, ['#productTitle', 'h1', 'meta[property="og:title"]', 'title']);
  if (!title) {
    title = firstAttr($, ['meta[property="og:title"]', 'meta[name="title"]'], 'content');
  }

  let brand = normalizeBrand(
    jsonLd.brand || firstText($, ['#bylineInfo', '[itemprop="brand"]', '.brand', 'h1.pdp-title'])
  );

  let category = safeText(jsonLd.category);
  let image = jsonLd.image || firstAttr($, ['#landingImage', '#imgTagWrapperId img', 'meta[property="og:image"]'], 'src');
  if (!image) {
    image = firstAttr($, ['meta[property="og:image"]', 'meta[name="twitter:image"]'], 'content');
  }

  let rating = safeText(jsonLd.rating);
  let priceText = safeText(jsonLd.priceText);

  if (platform === 'amazon') {
    title = title || firstAttr($, ['meta[name="title"]', 'meta[property="og:title"]'], 'content');
    brand = normalizeBrand(brand || firstText($, ['#bylineInfo']));

    const crumbs = [];
    $('#wayfinding-breadcrumbs_feature_div li a, #wayfinding-breadcrumbs_container li a').each((_, el) => {
      const text = normalizeWhitespace($(el).text());
      if (text) crumbs.push(text);
    });
    category = category || (crumbs.length ? crumbs[crumbs.length - 1] : '');

    priceText = priceText || extractAmazonPriceText($, rawHTML);
  }

  if (platform === 'flipkart') {
    title = title || firstText($, ['span.VU-ZEz', 'span.B_NuCI', 'h1.yhB1nd span', 'h1._9E25nV']);
    brand = normalizeBrand(brand || firstText($, ['span.mEh187', 'span.G6XhRU']));
    image = image || firstAttr($, ['img._396cs4', 'img.DByuf4', 'meta[property="og:image"]'], 'src');
    priceText = priceText || extractFlipkartPriceText($, rawHTML);
  }

  if (platform === 'myntra') {
    title = title || firstText($, ['h1.pdp-name', 'h1.pdp-title']);
    brand = normalizeBrand(brand || firstText($, ['h1.pdp-title']));
    category = category || 'fashion';
    priceText = priceText || extractMyntraPriceText($, rawHTML);
  }

  if (platform === 'generic') {
    priceText = priceText || extractGenericPriceText($, rawHTML);
  }

  const availabilityText = extractAvailabilityText($, rawHTML);
  const unavailable = isLikelyUnavailable(availabilityText || rawHTML);
  const price = cleanPrice(priceText) || 0;

  if (!category) {
    category = detectCategory(title, category);
  }

  if (!rating) {
    rating = firstText($, ['[data-hook="rating-out-of-text"]', '.a-icon-alt', '[itemprop="ratingValue"]']);
  }

  return {
    title: normalizeWhitespace(title),
    price,
    priceText: normalizeWhitespace(priceText),
    currency: detectCurrency(priceText, url),
    brand,
    category,
    image: safeText(image),
    rating: normalizeWhitespace(rating),
    unavailable,
    availabilityText: normalizeWhitespace(availabilityText),
  };
};

const scoreExtraction = (extracted, candidate) => {
  let score = 0;

  if (!isJunkTitle(extracted.title)) score += 24;
  if (extracted.brand) score += 8;
  if (extracted.category) score += 6;
  if (extracted.image) score += 10;
  if (extracted.price > 0) score += 42;
  if (extracted.unavailable) score += 16;

  if (candidate.likelyBlocked) score -= 10;
  if (candidate.status >= 400) score -= 8;

  return score;
};

const fetchHTMLCandidates = async (url) => {
  const candidates = [];

  for (const strategy of FETCH_STRATEGIES) {
    try {
      const response = await axios.get(url, {
        headers: strategy.headers,
        timeout: REQUEST_TIMEOUT_MS,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const length = safeText(html).length;
      const likelyBlocked = isLikelyBlockedPage(html, response.status);

      if (length > 120) {
        candidates.push({
          html,
          status: response.status,
          strategy: strategy.name,
          likelyBlocked,
        });
      }

      logger.info('Scraper fetch attempt completed', {
        strategy: strategy.name,
        status: response.status,
        length,
        likelyBlocked,
      });

      // Stop early if we already have a strong candidate.
      if (!likelyBlocked && length > 50000) {
        break;
      }
    } catch (error) {
      logger.warn('Scraper fetch attempt failed', {
        strategy: strategy.name,
        error: error.message,
      });
    }
  }

  return candidates;
};

const fetchViaJinaMirror = async (url) => {
  const mirrorURL = `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, '')}`;

  try {
    const response = await axios.get(mirrorURL, {
      timeout: MIRROR_TIMEOUT_MS,
      validateStatus: (status) => status < 500,
    });

    const text = typeof response.data === 'string' ? response.data : '';
    if (text.length < 120) return null;

    logger.info('Jina mirror fetch completed', {
      status: response.status,
      length: text.length,
    });

    return text;
  } catch (error) {
    logger.warn('Jina mirror fetch failed', { error: error.message });
    return null;
  }
};

const extractFromMirror = (mirrorText, platform, url) => {
  const titleLine = mirrorText.match(/^Title:\s*(.+)$/m);
  const imageMatch = mirrorText.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/i);
  const priceMatch = mirrorText.match(/(?:₹|\$|€|£|INR|USD|EUR|GBP|Rs\.?)\s?[0-9][0-9,]*(?:\.[0-9]{1,2})?/i);

  const title = titleLine ? normalizeWhitespace(titleLine[1]) : '';
  const priceText = priceMatch ? safeText(priceMatch[0]) : '';
  const availabilityText = mirrorText.match(/currently unavailable|out of stock|temporarily out of stock/i)?.[0] || '';

  return {
    title,
    price: cleanPrice(priceText) || 0,
    priceText,
    currency: detectCurrency(priceText, url),
    brand: '',
    category: detectCategory(title, ''),
    image: imageMatch ? safeText(imageMatch[1]) : '',
    rating: '',
    unavailable: isLikelyUnavailable(availabilityText || mirrorText),
    availabilityText,
    platform: getPlatformLabel(platform),
  };
};

const makeProviderError = (provider, error) => {
  const status = error?.response?.status;
  const providerPrefix = provider === 'openai' ? 'OpenAI' : 'Gemini';

  if (status === 429) {
    return `${providerPrefix} rate limit or quota exceeded`;
  }

  if (status === 401 || status === 403) {
    return `${providerPrefix} authentication failed`;
  }

  return `${providerPrefix} extraction failed`;
};

const buildAIContext = (url, extraction, partialHTML = '') => {
  const lines = [`URL: ${url}`];

  if (extraction) {
    if (extraction.title) lines.push(`Detected title: ${extraction.title}`);
    if (extraction.brand) lines.push(`Detected brand: ${extraction.brand}`);
    if (extraction.category) lines.push(`Detected category: ${extraction.category}`);
    if (extraction.availabilityText) lines.push(`Availability note: ${extraction.availabilityText}`);
  }

  if (partialHTML) {
    const $ = cheerio.load(partialHTML);
    const pageTitle = normalizeWhitespace($('title').text());
    const ogTitle = safeText($('meta[property="og:title"]').attr('content'));
    const ogDesc = safeText($('meta[property="og:description"]').attr('content'));
    const h1 = normalizeWhitespace($('h1').first().text());

    if (pageTitle) lines.push(`Page title: ${pageTitle}`);
    if (ogTitle) lines.push(`OG title: ${ogTitle}`);
    if (ogDesc) lines.push(`OG description: ${ogDesc}`);
    if (h1) lines.push(`H1: ${h1}`);

    const priceHints = [];
    const priceRegex = /(?:₹|\$|€|£|INR|USD|EUR|GBP|Rs\.?)\s?[0-9][0-9,]*(?:\.[0-9]{1,2})?/gi;
    let match;
    while ((match = priceRegex.exec(partialHTML)) && priceHints.length < 6) {
      priceHints.push(match[0]);
    }
    if (priceHints.length) {
      lines.push(`Observed price-like values: ${Array.from(new Set(priceHints)).join(', ')}`);
    }
  }

  lines.push('Important: If price is not explicitly present, return price as null. Do not guess a price.');

  return lines.join('\n');
};

const extractWithOpenAI = async (url, partialHTML = '', extraction = null) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI key not configured');
  }

  const context = buildAIContext(url, extraction, partialHTML);

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: [
            'You extract product fields from URL and page hints.',
            'Return only JSON without markdown.',
            'Schema:',
            '{"title":"string","price":number_or_null,"currency":"INR|USD|EUR|GBP","brand":"string","category":"electronics|fashion|beauty|home|sports|books|grocery|toys|","image":"string","platform":"string"}',
            'Never invent a price if the page does not clearly expose one.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: context,
        },
      ],
      temperature: 0.1,
      max_tokens: 320,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: AI_TIMEOUT_MS,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('OpenAI returned an empty response');
  }

  const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());

  return {
    title: safeText(parsed.title),
    price: parsed.price == null ? 0 : cleanPrice(parsed.price),
    priceText: parsed.price == null ? '' : safeText(parsed.price),
    currency: safeText(parsed.currency) || detectCurrency('', url),
    brand: safeText(parsed.brand),
    category: safeText(parsed.category),
    image: safeText(parsed.image),
    rating: '',
    platform: safeText(parsed.platform),
  };
};

const extractWithGemini = async (url, partialHTML = '', extraction = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini key not configured');
  }

  const prompt = buildAIContext(url, extraction, partialHTML);

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: AI_TIMEOUT_MS,
    }
  );

  const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) {
    throw new Error('Gemini returned an empty response');
  }

  const parsed = JSON.parse(content);

  return {
    title: safeText(parsed.title),
    price: parsed.price == null ? 0 : cleanPrice(parsed.price),
    priceText: parsed.price == null ? '' : safeText(parsed.price),
    currency: safeText(parsed.currency) || detectCurrency('', url),
    brand: safeText(parsed.brand),
    category: safeText(parsed.category),
    image: safeText(parsed.image),
    rating: '',
    platform: safeText(parsed.platform),
  };
};

const extractFromURL = (url) => {
  const platform = detectPlatform(url);
  const parsed = new URL(url);
  const pathParts = parsed.pathname.split('/').filter(Boolean);

  let slug = '';
  let brand = '';

  if (platform === 'amazon') {
    const dpIndex = pathParts.indexOf('dp');
    if (dpIndex > 0) {
      slug = pathParts[dpIndex - 1];
    } else {
      slug = pathParts.reduce((longest, current) => (current.length > longest.length ? current : longest), '');
    }
  } else if (platform === 'flipkart') {
    const pIndex = pathParts.indexOf('p');
    slug = pIndex > 0 ? pathParts[pIndex - 1] : pathParts[0] || '';
  } else if (platform === 'myntra') {
    if (pathParts.length >= 2) {
      brand = pathParts[0].replace(/-/g, ' ');
      slug = pathParts[1];
    } else {
      slug = pathParts[0] || '';
    }
  } else {
    slug = pathParts.reduce((longest, current) => (current.length > longest.length ? current : longest), '');
  }

  const title = normalizeWhitespace(
    safeText(slug)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );

  if (!brand && title) {
    const firstWord = title.split(' ')[0].toLowerCase();
    if (BRAND_HINTS.includes(firstWord)) {
      brand = title.split(' ')[0];
    }
  }

  return {
    title: title || 'Unknown Product',
    price: 0,
    currency: detectCurrency('', url),
    brand: brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '',
    category: detectCategory(title, ''),
    image: '',
    rating: '',
    platform: getPlatformLabel(platform),
    url,
    urlExtracted: true,
  };
};

const summariseFailureReason = ({ blocked, unavailable, aiErrors }) => {
  if (unavailable) {
    return 'This item appears unavailable or out of stock on the source page. Please enter the current price manually.';
  }

  if (aiErrors.length && blocked) {
    return 'Source site blocked automated extraction and AI fallback is currently rate-limited. Enter price manually for analysis.';
  }

  if (blocked) {
    return 'Source site blocked automated extraction for this request. Enter price manually for analysis.';
  }

  if (aiErrors.length) {
    return 'Automatic price extraction could not complete because AI fallback is unavailable. Enter price manually for analysis.';
  }

  return 'Product identified, but price could not be extracted reliably. Please enter the price manually.';
};

const toPayload = ({
  extracted,
  platform,
  url,
  extractionMethod,
  extractionNote = '',
  aiExtracted = false,
  urlExtracted = false,
}) => ({
  title: extracted.title || 'Unknown Product',
  price: extracted.price || 0,
  currency: extracted.currency || detectCurrency('', url),
  brand: extracted.brand || '',
  category: detectCategory(extracted.title, extracted.category),
  image: extracted.image || '',
  rating: extracted.rating || '',
  platform: extracted.platform || getPlatformLabel(platform),
  url,
  unavailable: Boolean(extracted.unavailable),
  availabilityText: extracted.availabilityText || '',
  extractionMethod,
  extractionNote,
  aiExtracted,
  urlExtracted,
});

const scrapeProductURL = async (url) => {
  const platform = detectPlatform(url);
  logger.info('Scraping URL', { url, platform });

  const fetchCandidates = await fetchHTMLCandidates(url);
  const aiErrors = [];

  let bestExtraction = null;
  let bestCandidate = null;
  let bestScore = -Infinity;

  for (const candidate of fetchCandidates) {
    try {
      const $ = cheerio.load(candidate.html);
      const extracted = extractFromHTML($, platform, candidate.html, url);
      const score = scoreExtraction(extracted, candidate);

      if (score > bestScore) {
        bestScore = score;
        bestExtraction = extracted;
        bestCandidate = candidate;
      }

      if (extracted.price > 0 && !isJunkTitle(extracted.title)) {
        const payload = toPayload({
          extracted,
          platform,
          url,
          extractionMethod: `html:${candidate.strategy}`,
        });
        logger.info('HTML extraction successful', {
          strategy: candidate.strategy,
          title: payload.title,
          price: payload.price,
        });
        return payload;
      }
    } catch (error) {
      logger.warn('Failed to parse fetched HTML candidate', {
        strategy: candidate.strategy,
        error: error.message,
      });
    }
  }

  if (bestExtraction?.unavailable) {
    return toPayload({
      extracted: bestExtraction,
      platform,
      url,
      extractionMethod: `html:${bestCandidate?.strategy || 'unknown'}`,
      extractionNote: 'This item appears unavailable or out of stock on the source page. Please enter the current price manually.',
    });
  }

  const mirrorText = await fetchViaJinaMirror(url);
  if (mirrorText) {
    const mirrored = extractFromMirror(mirrorText, platform, url);

    if (mirrored.price > 0 && !isJunkTitle(mirrored.title)) {
      logger.info('Mirror extraction successful', { title: mirrored.title, price: mirrored.price });
      return toPayload({
        extracted: mirrored,
        platform,
        url,
        extractionMethod: 'mirror:jina',
      });
    }

    if (mirrored.unavailable) {
      return toPayload({
        extracted: mirrored,
        platform,
        url,
        extractionMethod: 'mirror:jina',
        extractionNote: 'This item appears unavailable or out of stock on the source page. Please enter the current price manually.',
      });
    }

    if (!bestExtraction || scoreExtraction(mirrored, { likelyBlocked: false, status: 200 }) > bestScore) {
      bestExtraction = mirrored;
    }
  }

  const aiContextExtraction = bestExtraction && !isJunkTitle(bestExtraction.title) ? bestExtraction : null;
  const partialHTML = bestCandidate?.html || '';

  try {
    const openaiResult = await extractWithOpenAI(url, partialHTML, aiContextExtraction);
    if (openaiResult.title || openaiResult.price > 0) {
      logger.info('OpenAI extraction successful', { title: openaiResult.title, price: openaiResult.price || 0 });
      return toPayload({
        extracted: {
          ...openaiResult,
          unavailable: false,
          availabilityText: '',
          currency: openaiResult.currency || detectCurrency(openaiResult.priceText, url),
        },
        platform,
        url,
        extractionMethod: 'ai:openai',
        aiExtracted: true,
      });
    }
  } catch (error) {
    const reason = makeProviderError('openai', error);
    aiErrors.push(reason);
    logger.warn('OpenAI extraction failed', { error: error.message, reason });
  }

  try {
    const geminiResult = await extractWithGemini(url, partialHTML, aiContextExtraction);
    if (geminiResult.title || geminiResult.price > 0) {
      logger.info('Gemini extraction successful', { title: geminiResult.title, price: geminiResult.price || 0 });
      return toPayload({
        extracted: {
          ...geminiResult,
          unavailable: false,
          availabilityText: '',
          currency: geminiResult.currency || detectCurrency(geminiResult.priceText, url),
        },
        platform,
        url,
        extractionMethod: 'ai:gemini',
        aiExtracted: true,
      });
    }
  } catch (error) {
    const reason = makeProviderError('gemini', error);
    aiErrors.push(reason);
    logger.warn('Gemini extraction failed', { error: error.message, reason });
  }

  const fallback = extractFromURL(url);
  const extractionNote = summariseFailureReason({
    blocked: fetchCandidates.some((candidate) => candidate.likelyBlocked),
    unavailable: bestExtraction?.unavailable || false,
    aiErrors,
  });

  logger.info('Using URL fallback extraction', {
    url,
    reason: extractionNote,
    aiErrors,
  });

  return {
    ...fallback,
    extractionMethod: 'url-pattern',
    extractionNote,
    aiErrors,
  };
};

module.exports = {
  scrapeProductURL,
  detectPlatform,
  __test__: {
    cleanPrice,
    detectCurrency,
    detectCategory,
    extractFromURL,
    isLikelyBlockedPage,
    isLikelyUnavailable,
    summariseFailureReason,
  },
};
