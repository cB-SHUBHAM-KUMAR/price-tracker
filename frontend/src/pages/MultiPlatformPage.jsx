import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import './MultiPlatformPage.css';

const PLATFORM_INFO = {
  amazon: { name: 'Amazon', logo: '🛒', color: '#ff9900' },
  flipkart: { name: 'Flipkart', logo: '🛍️', color: '#2874f0' },
  myntra: { name: 'Myntra', logo: '👗', color: '#ff3f6c' },
};

function MultiPlatformPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [bestDeal, setBestDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);
    setBestDeal(null);

    try {
      const res = await api.post('/price/multi-search', { query: query.trim() });
      setResults(res.results);
      setBestDeal(res.bestDeal);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '—';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const totalResults = results
    ? results.amazon.length + results.flipkart.length + results.myntra.length
    : 0;

  return (
    <div className="multi-page">


      <header className="multi-page__header">
        <Link to="/" className="multi-page__back">← Back</Link>
        <h1 className="multi-page__title">🔍 Multi-Platform Search</h1>
        <p className="multi-page__subtitle">Compare prices across Amazon, Flipkart & Myntra</p>
      </header>

      <form className="multi-search-form" onSubmit={handleSearch}>
        <div className="multi-search-form__input-wrapper">
          <input
            type="text"
            className="multi-search-form__input"
            placeholder="Search for any product... (e.g. iPhone 15, Nike Air Max)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="multi-search-form__btn" disabled={loading || !query.trim()}>
            {loading ? '⏳ Searching...' : '🔍 Search All Platforms'}
          </button>
        </div>
      </form>

      {error && <div className="multi-error">{error}</div>}

      {loading && (
        <div className="multi-loading">
          <div className="multi-loading__spinner" />
          <p>Searching across platforms...</p>
        </div>
      )}

      {results && !loading && (
        <div className="multi-results">
          <div className="multi-results__summary">
            <span>Found <strong>{totalResults}</strong> results for "<strong>{query}</strong>"</span>
          </div>

          {bestDeal && (
            <div className="multi-best-deal">
              <span className="multi-best-deal__badge">🏆 Best Deal</span>
              <h3 className="multi-best-deal__title">{bestDeal.title}</h3>
              <div className="multi-best-deal__info">
                <span className="multi-best-deal__price">{formatPrice(bestDeal.price)}</span>
                <span className="multi-best-deal__platform">on {bestDeal.platform}</span>
                <a href={bestDeal.url} target="_blank" rel="noopener noreferrer" className="multi-best-deal__link">
                  View Deal →
                </a>
              </div>
            </div>
          )}

          <div className="multi-platforms">
            {Object.entries(PLATFORM_INFO).map(([key, info]) => {
              const platformResults = results[key] || [];
              return (
                <div key={key} className="platform-section" style={{ '--platform-color': info.color }}>
                  <div className="platform-section__header">
                    <span className="platform-section__logo">{info.logo}</span>
                    <h3 className="platform-section__name">{info.name}</h3>
                    <span className="platform-section__count">{platformResults.length} results</span>
                  </div>

                  {platformResults.length === 0 && (
                    <p className="platform-section__empty">No results found on {info.name}</p>
                  )}

                  <div className="platform-section__items">
                    {platformResults.map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`platform-item ${item.isSearchLink ? 'platform-item--link' : ''} ${
                          bestDeal && item.title === bestDeal.title && item.platform === bestDeal.platform ? 'platform-item--best' : ''
                        }`}
                      >
                        {item.image && (
                          <img src={item.image} alt="" className="platform-item__img" loading="lazy" />
                        )}
                        <div className="platform-item__info">
                          <h4 className="platform-item__title">{item.title}</h4>
                          {item.rating && <span className="platform-item__rating">⭐ {item.rating}</span>}
                        </div>
                        <div className="platform-item__price-area">
                          {item.price > 0 ? (
                            <span className="platform-item__price">{formatPrice(item.price)}</span>
                          ) : (
                            <span className="platform-item__price platform-item__price--search">Visit →</span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiPlatformPage;
