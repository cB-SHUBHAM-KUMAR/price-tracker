import PriceForm from '../features/price-checker/components/PriceForm';
import ResultCard from '../features/price-checker/components/ResultCard';
import { usePriceAnalysis } from '../features/price-checker/hooks/usePriceAnalysis';
import './PriceCheckerPage.css';

const QUICK_FACTS = [
  { label: 'Average response', value: '< 1 sec' },
  { label: 'Confidence dimensions', value: '12+' },
  { label: 'Assets supported', value: 'Products, Hotels, Flights' },
  { label: 'Price models', value: 'Reference + demand + surge' },
];

const CHECKLIST_ITEMS = [
  'Use the exact listed price including taxes or fees when possible.',
  'Add product brand/category to improve reference price matching.',
  'For hotels and flights, set the real travel date for better seasonality scoring.',
];

const OUTPUT_ITEMS = [
  'Fair price baseline and expected range',
  'Surge and volatility signal breakdown',
  'Confidence scoring with data quality factors',
  'Action-oriented buy or wait recommendation',
];

function PriceCheckerPage() {
  const { result, loading, error, analyze, reset } = usePriceAnalysis();

  return (
    <div className="price-checker-page">
      <header className="price-checker-page__header">
        <div className="price-checker-page__hero">
          <div className="price-checker-page__hero-copy">
            <p className="price-checker-page__eyebrow">Decision Intelligence Workspace</p>
            <h1 className="price-checker-page__title">
              Analyze Price Fairness
              <span className="price-checker-page__title-accent"> Before You Pay</span>
            </h1>
            <p className="price-checker-page__subtitle">
              Feed a listing URL or enter details manually to score whether the current price is fair,
              inflated, or a strong deal in current market conditions.
            </p>
          </div>
          <div className="price-checker-page__hero-panel" aria-label="Analysis output summary">
            <h2>Analysis output</h2>
            <ul>
              {OUTPUT_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="price-checker-page__facts" aria-label="Key platform stats">
          {QUICK_FACTS.map((fact) => (
            <div key={fact.label} className="facts-chip">
              <span className="facts-chip__label">{fact.label}</span>
              <span className="facts-chip__value">{fact.value}</span>
            </div>
          ))}
        </div>
      </header>

      <main className="price-checker-page__content">
        {error && (
          <div className="price-error animate-in" role="alert">
            <p>{error}</p>
            <button type="button" onClick={reset}>
              Dismiss
            </button>
          </div>
        )}

        {!result ? (
          <div className="price-checker-page__workspace">
            <section className="price-checker-page__form-pane">
              <PriceForm onSubmit={analyze} loading={loading} />
            </section>

            <aside className="price-checker-page__insights" aria-label="Analysis guidance">
              <div className="insight-card">
                <h2>Before you run analysis</h2>
                <ul>
                  {CHECKLIST_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="insight-card insight-card--signal">
                <h3>Signal model</h3>
                <p>
                  Final verdict blends category baselines, demand pressure, surge detection, and confidence quality.
                </p>
              </div>
              <div className="insight-card insight-card--highlight">
                <h3>Execution note</h3>
                <p>
                  If marketplaces block automated extraction, input the listed price manually to still receive a full decision report.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <section className="price-checker-page__result-shell" aria-label="Analysis result">
            <div className="result-shell__header">
              <p className="result-shell__eyebrow">Decision Report</p>
              <h2 className="result-shell__title">Price Fairness Outcome</h2>
            </div>
            <ResultCard data={result} onReset={reset} />
          </section>
        )}
      </main>
    </div>
  );
}

export default PriceCheckerPage;
