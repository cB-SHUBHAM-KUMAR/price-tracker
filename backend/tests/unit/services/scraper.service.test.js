const { __test__, detectPlatform } = require('../../../src/api/v1/services/scraper.service');

describe('scraper.service helpers', () => {
  it('parses formatted currency strings safely', () => {
    expect(__test__.cleanPrice('\u20B939,999.00')).toBe(39999);
    expect(__test__.cleanPrice('INR 1,24,499')).toBe(124499);
    expect(__test__.cleanPrice('')).toBeNull();
  });

  it('detects currency from symbols and domains', () => {
    expect(__test__.detectCurrency('\u20B939,999', 'https://www.amazon.in/dp/abc')).toBe('INR');
    expect(__test__.detectCurrency('$199.99', 'https://example.com/item')).toBe('USD');
    expect(__test__.detectCurrency('', 'https://store.example.in/item')).toBe('INR');
  });

  it('does not mark normal product HTML as blocked due to "isRobot:false" text', () => {
    const html = '<html><title>Apple iPhone 15</title><script>{"isRobot":false}</script></html>';
    expect(__test__.isLikelyBlockedPage(html, 200)).toBe(false);
  });

  it('extracts product metadata from URL fallback', () => {
    const extracted = __test__.extractFromURL(
      'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4'
    );

    expect(extracted.title).toContain('Apple Iphone 15 Black 128 Gb');
    expect(extracted.platform).toBe('Flipkart');
    expect(extracted.urlExtracted).toBe(true);
    expect(extracted.price).toBe(0);
  });

  it('summarises fallback reason with correct priority', () => {
    expect(
      __test__.summariseFailureReason({
        blocked: true,
        unavailable: true,
        aiErrors: ['OpenAI rate limit or quota exceeded'],
      })
    ).toContain('unavailable');

    expect(
      __test__.summariseFailureReason({
        blocked: true,
        unavailable: false,
        aiErrors: ['OpenAI rate limit or quota exceeded'],
      })
    ).toContain('blocked');
  });

  it('detects platform correctly', () => {
    expect(detectPlatform('https://www.amazon.in/dp/B0DPS62DYH')).toBe('amazon');
    expect(detectPlatform('https://www.myntra.com/shoes/puma/123')).toBe('myntra');
    expect(detectPlatform('https://example.org/product/123')).toBe('generic');
  });
});
