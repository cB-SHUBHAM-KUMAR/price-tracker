import { Link } from 'react-router-dom';
import './HomePage.css';

/* ─── Clean SVG Icons ───────────────────────────────────── */
const Icons = {
  brain: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>
  ),
  surge: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  ),
  target: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  bell: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  scale: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 7h18"/><path d="M6 7v6a6 6 0 0 0 12 0V7"/></svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  )
};

const FEATURES = [
  {
    icon: Icons.brain,
    title: 'AI-Powered Analysis',
    desc: 'Multi-factor pricing engine analyzes brand, category, seasonality, and demand in real time.',
  },
  {
    icon: Icons.surge,
    title: 'Surge Detection',
    desc: 'Detects price spikes and surge patterns so you never overpay during peak demand.',
  },
  {
    icon: Icons.target,
    title: 'Confidence Score',
    desc: 'Every analysis comes with a transparency score so you know how reliable the estimate is.',
  },
  {
    icon: Icons.bell,
    title: 'Smart Alerts',
    desc: 'Set custom price alerts and get notified the moment your target price is hit.',
  },
  {
    icon: Icons.chart,
    title: 'Price History',
    desc: 'Track price trends over time and spot the best windows to buy.',
  },
  {
    icon: Icons.scale,
    title: 'Side-by-Side Compare',
    desc: 'Compare multiple products instantly and see which offers the best value.',
  },
];

const STEPS = [
  {
    num: '1',
    title: 'Input Data',
    desc: 'Provide a product link, flight details, or hotel booking dates along with basic context.',
  },
  {
    num: '2',
    title: 'Algorithmic Check',
    desc: 'Our engine runs demand estimation, historical surge detection, and fair price parsing.',
  },
  {
    num: '3',
    title: 'Final Verdict',
    desc: 'Receive a structured analysis indicating whether to buy now, wait, or find alternatives.',
  },
];

const TICKER_ITEMS = [
  'iPhone 16 Pro — ₹1,34,900 → Fair Price: ₹1,19,500',
  'DEL - BOM Flight — ₹6,200 → Fair Price: ₹4,800',
  'Goa Resort (Nov) — ₹12,000/nt → Fair Price: ₹8,900',
  'Nike Air Max — ₹14,995 → Fair Price: ₹10,200',
  'MacBook Air M3 — ₹1,14,900 → Fair Price: ₹99,500',
  'Samsung S24 Ultra — ₹1,29,999 → Fair: ₹1,10,000',
];

function HomePage() {
  return (
    <div className="home-page">
      {/* ─── Minimal Background Grid ─────────────────────────────── */}
      <div className="home-page__bg">
        <div className="grid-pattern" />
      </div>

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="home-hero">
        <span className="home-hero__badge">
          Price Intelligence v2.0
        </span>
        <h1 className="home-hero__title">
          Never Overpay.
          <br />
          <span className="home-hero__title-accent">Know the Fair Price.</span>
        </h1>
        <p className="home-hero__subtitle">
          Dynamic Price Checker uses AI heuristics to analyze products, flights, and hotels — telling
          you with confidence if a price is fair, inflated, or a genuine deal.
        </p>
        <div className="home-hero__actions">
          <Link to="/price-checker" className="home-btn home-btn--primary">
            {Icons.search}
            Start Analysis
          </Link>
          <Link to="/alerts" className="home-btn home-btn--secondary">
            Set Alerts
          </Link>
        </div>
      </section>

      {/* ─── Stats Banner ───────────────────────────────────────────── */}
      <div className="home-stats-banner">
        <div className="home-stats-banner__inner">
          <div className="home-stat">
            <span className="home-stat__value">12+</span>
            <span className="home-stat__label">Factors Analyzed</span>
          </div>
          <div className="home-stat">
            <span className="home-stat__value">3</span>
            <span className="home-stat__label">Asset Categories</span>
          </div>
          <div className="home-stat">
            <span className="home-stat__value">&lt;1s</span>
            <span className="home-stat__label">P99 Latency</span>
          </div>
          <div className="home-stat">
            <span className="home-stat__value">98%</span>
            <span className="home-stat__label">Data Confidence</span>
          </div>
        </div>
      </div>

      {/* ─── Features ────────────────────────────────────────── */}
      <section className="home-features">
        <div className="home-section-header">
          <h2 className="home-section__title">Platform Capabilities</h2>
          <p className="home-section__subtitle">
            A comprehensive toolkit designed for programmatic purchasing decisions.
          </p>
        </div>
        <div className="home-features__grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="feature-card"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="feature-card__icon-wrap">
                {f.icon}
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pipeline (How It Works) ─────────────────────────── */}
      <section className="home-how">
        <div className="home-section-header">
          <h2 className="home-section__title">Analysis Pipeline</h2>
          <p className="home-section__subtitle">How we determine fair value in real-time.</p>
        </div>
        <div className="home-how__steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="how-step" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="how-step__number">{s.num}</div>
              <div className="how-step__content">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Clean Ticker Footer ─────────────────────────────────────── */}
      <div className="home-ticker">
        <div className="home-ticker__track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="home-ticker__item">{item}</span>
          ))}
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="home-footer">
        <div className="home-footer__content">
          <span>© {new Date().getFullYear()} PriceFair by AntiGravity.</span>
          <div className="home-footer__links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/history">History</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
