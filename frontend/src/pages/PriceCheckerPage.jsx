import PriceForm from '../features/price-checker/components/PriceForm';
import ResultCard from '../features/price-checker/components/ResultCard';
import { usePriceAnalysis } from '../features/price-checker/hooks/usePriceAnalysis';
import './PriceCheckerPage.css';

const QUICK_FACTS = [
  { label: 'Avg analysis time', value: '< 1s' },
  { label: 'Confidence factors', value: '12+' },
  { label: 'Supported types', value: '3' },
];

const CHECKLIST_ITEMS = [
  'Use the exact listed price including taxes or fees when possible.',
  'Add product brand/category to improve reference price matching.',
  'For hotels and flights, set the real travel date for better seasonality scoring.',
];

function PriceCheckerPage() {
  const { result, loading, error, analyze, reset } = usePriceAnalysis();

  return (
    <div className="price-checker-page">
      <header className="price-checker-page__header">
        <p className="price-checker-page__eyebrow">Real-time pricing intelligence</p>
        <h1 className="page-title">Dynamic Price Fairness Checker</h1>
        <p className="page-subtitle">
          Evaluate products, hotels, and flights against market signals before you buy.
        </p>
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
                <h2>Before you analyze</h2>
                <ul>
                  {CHECKLIST_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="insight-card insight-card--highlight">
                <h3>Output includes</h3>
                <p>
                  Fair price range, surge score, confidence breakdown, demand signals, and a recommended action.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <ResultCard data={result} onReset={reset} />
        )}
      </main>
    </div>
  );
}

export default PriceCheckerPage;
