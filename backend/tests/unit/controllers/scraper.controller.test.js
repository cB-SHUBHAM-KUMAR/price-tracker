jest.mock('../../../src/api/v1/services/scraper.service', () => ({
  scrapeProductURL: jest.fn(),
}));

const { scrapeProductURL } = require('../../../src/api/v1/services/scraper.service');
const { scrapeURL } = require('../../../src/api/v1/controllers/scraper.controller');

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('scraper.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for missing URL', async () => {
    const req = { body: {} };
    const res = createRes();
    const next = jest.fn();

    await scrapeURL(req, res, next);

    expect(scrapeProductURL).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Please provide a valid URL',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 200 with scraped payload', async () => {
    const req = { body: { url: 'https://www.amazon.in/dp/B0CHX1W1XY' } };
    const res = createRes();
    const next = jest.fn();
    const mockedPayload = {
      title: 'Sample Product',
      price: 24999,
      currency: 'INR',
    };

    scrapeProductURL.mockResolvedValue(mockedPayload);

    await scrapeURL(req, res, next);

    expect(scrapeProductURL).toHaveBeenCalledWith(req.body.url);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Product data extracted successfully',
        data: mockedPayload,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 422 when scraping fails', async () => {
    const req = { body: { url: 'https://www.amazon.in/dp/B0CHX1W1XY' } };
    const res = createRes();
    const next = jest.fn();

    scrapeProductURL.mockRejectedValue(new Error('Blocked by captcha'));

    await scrapeURL(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Blocked by captcha',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
