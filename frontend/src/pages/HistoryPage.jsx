import { useEffect, useMemo, useState } from 'react';
import priceApi from '../features/price-checker/api/price.api';
import {
  formatCurrency,
  getPositionColor,
  getPositionEmoji,
} from '../features/price-checker/services/priceFormatter';
import './HistoryPage.css';

const FILTER_OPTIONS = ['all', 'product', 'hotel', 'flight'];

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await priceApi.getHistory({ limit: 50 });
        setHistory(response.data || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? history : history.filter((item) => item.type === filter)),
    [filter, history]
  );

  const stats = useMemo(
    () => ({
      total: history.length,
      overpriced: history.filter((item) => item.pricePosition === 'Overpriced').length,
      fair: history.filter((item) => item.pricePosition === 'Fair').length,
      deals: history.filter((item) => ['Good Deal', 'Underpriced'].includes(item.pricePosition)).length,
    }),
    [history]
  );

  return (
    <div className="history-page">
      <header className="history-page__header">
        <p className="history-page__eyebrow">Recorded analysis outcomes</p>
        <h1 className="page-heading">
          Price <span className="heading-accent">Analysis History</span>
        </h1>
        <p className="page-subheading">
          Track prior checks and identify patterns before making your next purchase.
        </p>
      </header>

      <main className="history-page__content">
        <section className="history-stats" aria-label="Summary stats">
          <div className="stat-card">
            <span className="stat-card__number">{stats.total}</span>
            <span className="stat-card__label">Total analyses</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__number">{stats.deals}</span>
            <span className="stat-card__label">Deals found</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__number">{stats.fair}</span>
            <span className="stat-card__label">Fair prices</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__number">{stats.overpriced}</span>
            <span className="stat-card__label">Overpriced</span>
          </div>
        </section>

        <div className="history-filter" role="tablist" aria-label="Filter by type">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-btn ${filter === option ? 'filter-btn--active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="history-loading">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="history-empty">No analysis history available for this filter.</div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Current</th>
                  <th>Fair</th>
                  <th>Position</th>
                  <th>Confidence</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const position = item.pricePosition || item.result?.pricePosition;
                  return (
                    <tr key={item._id || item.analyzedAt}>
                      <td>{item.type}</td>
                      <td className="history-table__title">
                        {item.inputPayload?.metadata?.title || item.input?.metadata?.title || 'Untitled'}
                      </td>
                      <td>{formatCurrency(item.result?.currentPrice || item.currentPrice)}</td>
                      <td className="history-table__fair">
                        {formatCurrency(item.result?.fairPrice || item.fairPrice)}
                      </td>
                      <td>
                        <span className="position-badge" style={{ color: getPositionColor(position) }}>
                          {getPositionEmoji(position)} {position}
                        </span>
                      </td>
                      <td>
                        <span className="confidence-badge">
                          {item.confidenceScore || item.result?.confidenceScore}%
                        </span>
                      </td>
                      <td className="history-table__date">
                        {new Date(item.createdAt || item.analyzedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default HistoryPage;
