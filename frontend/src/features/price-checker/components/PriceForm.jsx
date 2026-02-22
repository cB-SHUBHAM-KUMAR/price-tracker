import { useState } from 'react';
import priceApi from '../api/price.api';
import './PriceForm.css';

const TYPE_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'flight', label: 'Flight' },
];

function PriceForm({ onSubmit, loading }) {
  const [type, setType] = useState('product');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [metadata, setMetadata] = useState({
    title: '',
    brand: '',
    category: '',
    location: '',
    travelDate: '',
    route: '',
  });

  // ─── URL Scraping State ───────────────────────────────────────────
  const [productUrl, setProductUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [scrapedImage, setScrapedImage] = useState('');
  const [scrapedPlatform, setScrapedPlatform] = useState('');

  const handleMetaChange = (field, value) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleScrapeURL = async () => {
    if (!productUrl.trim()) return;
    setScraping(true);
    setScrapeError('');
    setScrapedImage('');
    setScrapedPlatform('');

    try {
      const response = await priceApi.scrapeURL(productUrl.trim());
      const data = response?.data || {};

      // Auto-fill form fields
      if (data.title) handleMetaChange('title', data.title);
      if (data.brand) handleMetaChange('brand', data.brand);
      if (data.category) handleMetaChange('category', data.category);
      if (data.price) setPrice(data.price.toString());
      if (data.currency) setCurrency(data.currency);
      if (data.image) setScrapedImage(data.image);
      if (data.platform) setScrapedPlatform(data.platform);

      // If price couldn't be scraped (URL-only extraction), prompt user
      if (!data.price && data.urlExtracted) {
        setScrapeError('Product identified! Please enter the price manually below.');
      }
    } catch (err) {
      setScrapeError(err.response?.data?.message || 'Failed to extract product data. Try entering details manually.');
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price || price <= 0) return;
    onSubmit({ type, price: parseFloat(price), currency, metadata });
  };

  return (
    <form className="price-form" onSubmit={handleSubmit}>
      <div className="price-form__header">
        <h2 className="price-form__title">AI Price Analysis</h2>
        <p className="price-form__subtitle">Paste a product link or enter details manually</p>
      </div>

      {/* ─── URL Paste Section ──────────────────────────────────── */}
      <div className="price-form__url-section">
        <label className="url-section__label">
          Paste Product URL
          <span className="url-section__platforms">Amazon · Flipkart · Myntra · Any e-commerce</span>
        </label>
        <div className="url-section__input-row">
          <input
            type="url"
            className="url-section__input"
            placeholder="https://www.amazon.in/dp/B0CHX1W1XY"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            disabled={scraping}
          />
          <button
            type="button"
            className={`url-section__btn ${scraping ? 'url-section__btn--loading' : ''}`}
            onClick={handleScrapeURL}
            disabled={scraping || !productUrl.trim()}
          >
            {scraping ? (
              <><span className="url-section__spinner" /> Fetching...</>
            ) : (
              'Fetch'
            )}
          </button>
        </div>
        {scrapeError && <p className="url-section__error">{scrapeError}</p>}
        {scrapedPlatform && !scrapeError && (
          <div className="url-section__success">
            <span className="url-section__success-icon"></span>
            <span>Extracted from <strong>{scrapedPlatform}</strong> — review &amp; adjust below</span>
          </div>
        )}
        {scrapedImage && (
          <div className="url-section__image-preview">
            <img src={scrapedImage} alt="Product" className="url-section__image" />
          </div>
        )}
        <div className="url-section__divider">
          <span>or enter details manually</span>
        </div>
      </div>

      {/* Type Selector */}
      <div className="price-form__type-selector">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`type-btn ${type === opt.value ? 'type-btn--active' : ''}`}
            onClick={() => setType(opt.value)}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Price & Currency */}
      <div className="price-form__row">
        <div className="price-form__group price-form__group--price">
          <label>Price *</label>
          <div className="price-input-wrapper">
            <span className="price-input-symbol">{currency === 'INR' ? '₹' : '$'}</span>
            <input
              type="number"
              placeholder="24,999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="1"
              className="price-input"
            />
          </div>
        </div>
        <div className="price-form__group price-form__group--currency">
          <label>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="currency-select">
            <option value="INR">INR ₹</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </select>
        </div>
      </div>

      {/* Dynamic Metadata Fields */}
      <div className="price-form__metadata">
        <div className="price-form__group">
          <label>{type === 'flight' ? 'Airline / Title' : 'Product / Hotel Name'}</label>
          <input
            type="text"
            placeholder={type === 'flight' ? 'IndiGo 6E-204' : 'iPhone 15 Pro Max'}
            value={metadata.title}
            onChange={(e) => handleMetaChange('title', e.target.value)}
          />
        </div>

        {type === 'product' && (
          <>
            <div className="price-form__row">
              <div className="price-form__group">
                <label>Brand</label>
                <input
                  type="text"
                  placeholder="Apple, Samsung, Nike..."
                  value={metadata.brand}
                  onChange={(e) => handleMetaChange('brand', e.target.value)}
                />
              </div>
              <div className="price-form__group">
                <label>Category</label>
                <select value={metadata.category} onChange={(e) => handleMetaChange('category', e.target.value)}>
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Living</option>
                  <option value="beauty">Beauty</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                  <option value="grocery">Grocery</option>
                  <option value="toys">Toys</option>
                </select>
              </div>
            </div>
          </>
        )}

        {type === 'hotel' && (
          <div className="price-form__row">
            <div className="price-form__group">
              <label>Location</label>
              <input
                type="text"
                placeholder="Goa, Mumbai, Dubai..."
                value={metadata.location}
                onChange={(e) => handleMetaChange('location', e.target.value)}
              />
            </div>
            <div className="price-form__group">
              <label>Check-in Date</label>
              <input
                type="date"
                value={metadata.travelDate}
                onChange={(e) => handleMetaChange('travelDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {type === 'flight' && (
          <div className="price-form__row">
            <div className="price-form__group">
              <label>Route</label>
              <input
                type="text"
                placeholder="DEL → BOM"
                value={metadata.route}
                onChange={(e) => handleMetaChange('route', e.target.value)}
              />
            </div>
            <div className="price-form__group">
              <label>Travel Date</label>
              <input
                type="date"
                value={metadata.travelDate}
                onChange={(e) => handleMetaChange('travelDate', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`price-form__submit ${loading ? 'price-form__submit--loading' : ''}`}
        disabled={loading || !price}
      >
        {loading ? (
          <>
            <span className="submit-spinner" />
            Analyzing market signals…
          </>
        ) : (
          <>Analyze Price</>
        )}
      </button>
    </form>
  );
}

export default PriceForm;
