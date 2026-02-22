import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import './DashboardPage.css';

const POSITION_COLORS = {
  Underpriced: '#22c55e',
  Fair: '#6366f1',
  'Slightly Overpriced': '#f59e0b',
  Overpriced: '#ef4444',
  'Significantly Overpriced': '#dc2626',
};

const TYPE_EMOJIS = { product: '📦', hotel: '🏨', flight: '✈️' };

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.stats);
      } catch {
        // silently fail — dashboard shows empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-loading">
          <div className="dash-loading__spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="dash-page">


      <header className="dash-header">
        <div>
          <h1 className="dash-header__title">📊 Dashboard</h1>
          <p className="dash-header__subtitle">Your price intelligence overview</p>
        </div>
        <Link to="/price-checker" className="dash-header__cta">+ New Analysis</Link>
      </header>

      {/* ─── Stat Cards ─────────────────────────────── */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon">📈</span>
          <div className="dash-stat-card__value">{s.totalAnalyses || 0}</div>
          <div className="dash-stat-card__label">Total Analyses</div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon">🎯</span>
          <div className="dash-stat-card__value">{s.avgConfidence || 0}%</div>
          <div className="dash-stat-card__label">Avg Confidence</div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon">🔔</span>
          <div className="dash-stat-card__value">{s.activeAlerts || 0}</div>
          <div className="dash-stat-card__label">Active Alerts</div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon">📦</span>
          <div className="dash-stat-card__value">{(s.typeDistribution || []).length}</div>
          <div className="dash-stat-card__label">Categories Used</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* ─── Type Distribution ──────────────────── */}
        <div className="dash-card">
          <h3 className="dash-card__title">Analysis by Type</h3>
          {(s.typeDistribution || []).length === 0 ? (
            <p className="dash-card__empty">No data yet</p>
          ) : (
            <div className="dash-type-bars">
              {s.typeDistribution.map((t) => {
                const total = s.totalAnalyses || 1;
                const pct = Math.round((t.count / total) * 100);
                return (
                  <div key={t.type} className="dash-type-bar">
                    <div className="dash-type-bar__label">
                      <span>{TYPE_EMOJIS[t.type] || '📦'} {t.type}</span>
                      <span>{t.count} ({pct}%)</span>
                    </div>
                    <div className="dash-type-bar__track">
                      <div className="dash-type-bar__fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Price Position Distribution ────────── */}
        <div className="dash-card">
          <h3 className="dash-card__title">Price Positions</h3>
          {(s.positionDistribution || []).length === 0 ? (
            <p className="dash-card__empty">No data yet</p>
          ) : (
            <div className="dash-positions">
              {s.positionDistribution.map((p) => (
                <div key={p.position} className="dash-pos-chip" style={{ borderColor: POSITION_COLORS[p.position] || '#6366f1' }}>
                  <span className="dash-pos-chip__dot" style={{ background: POSITION_COLORS[p.position] || '#6366f1' }} />
                  <span className="dash-pos-chip__name">{p.position}</span>
                  <span className="dash-pos-chip__count">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Recent Analyses ────────────────────── */}
        <div className="dash-card dash-card--wide">
          <h3 className="dash-card__title">Recent Analyses</h3>
          {(s.recentAnalyses || []).length === 0 ? (
            <p className="dash-card__empty">No analyses yet. <Link to="/price-checker">Run your first!</Link></p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr><th>Item</th><th>Type</th><th>Price</th><th>Verdict</th><th>Confidence</th></tr>
              </thead>
              <tbody>
                {s.recentAnalyses.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title || '—'}</td>
                    <td>{TYPE_EMOJIS[a.type] || ''} {a.type}</td>
                    <td>₹{(a.price || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: POSITION_COLORS[a.position] || '#6366f1' }}>{a.position || '—'}</td>
                    <td>{a.confidence || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ─── Top Items ─────────────────────────── */}
        <div className="dash-card">
          <h3 className="dash-card__title">🏆 Most Analyzed</h3>
          {(s.topItems || []).length === 0 ? (
            <p className="dash-card__empty">No data yet</p>
          ) : (
            <div className="dash-top-list">
              {s.topItems.map((t, i) => (
                <div key={t.name} className="dash-top-item">
                  <span className="dash-top-item__rank">#{i + 1}</span>
                  <div className="dash-top-item__info">
                    <span className="dash-top-item__name">{t.name}</span>
                    <span className="dash-top-item__meta">{t.count} analyses · avg ₹{t.avgPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
