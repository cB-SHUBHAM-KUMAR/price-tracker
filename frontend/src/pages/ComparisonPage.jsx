import { useMemo, useState } from 'react';
import { formatCurrency, getPositionColor, getPositionEmoji } from '../features/price-checker/services/priceFormatter';
import priceApi from '../features/price-checker/api/price.api';
import './ComparisonPage.css';

const EMPTY_ITEM = {
  title: '',
  type: 'product',
  price: '',
  currency: 'INR',
  brand: '',
  category: '',
};

const TYPE_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'flight', label: 'Flight' },
];

function ComparisonPage() {
  const [items, setItems] = useState([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    if (items.length >= 5) return;
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index) => {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const analyzeAll = async () => {
    const validItems = items.filter((item) => Number(item.price) > 0);
    if (!validItems.length) {
      setError('Add at least one item with a valid price.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const responses = await Promise.all(
        validItems.map((item) =>
          priceApi.analyze({
            type: item.type,
            price: parseFloat(item.price),
            currency: item.currency,
            metadata: {
              title: item.title,
              brand: item.brand,
              category: item.category,
            },
          })
        )
      );

      setResults(responses.map((response) => response.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const bestDeal = useMemo(() => {
    if (!results.length) return null;

    return results.reduce((best, result, index) => {
      if (!best || result.priceDeviation < best.deviation) {
        return { index, deviation: result.priceDeviation };
      }
      return best;
    }, null);
  }, [results]);

  return (
    <div className="comparison-page">
      <header className="comparison-page__header">
        <p className="comparison-page__eyebrow">Cross-item decision support</p>
        <h1 className="page-heading">
          Price <span className="heading-accent">Comparison Workspace</span>
        </h1>
        <p className="page-subheading">
          Run parallel analysis and identify the strongest value candidate instantly.
        </p>
      </header>

      <main className="comparison-page__content">
        {error && <div className="page-error" role="alert">{error}</div>}

        <section className="comparison-inputs" aria-label="Comparison inputs">
          {items.map((item, index) => (
            <article key={index} className="comparison-input-card">
              <div className="comparison-input-card__header">
                <span className="comparison-input-card__num">Item {index + 1}</span>
                {items.length > 2 && (
                  <button
                    type="button"
                    className="comparison-input-card__remove"
                    onClick={() => removeItem(index)}
                    aria-label={`Remove item ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Name"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
              />

              <div className="comparison-input-card__row">
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                  min="1"
                />

                <select value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value)}>
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <select value={item.currency} onChange={(e) => updateItem(index, 'currency', e.target.value)}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="comparison-input-card__row">
                <input
                  type="text"
                  placeholder="Brand"
                  value={item.brand}
                  onChange={(e) => updateItem(index, 'brand', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={item.category}
                  onChange={(e) => updateItem(index, 'category', e.target.value)}
                />
              </div>
            </article>
          ))}

          {items.length < 5 && (
            <button type="button" className="comparison-add-btn" onClick={addItem}>
              Add another item
            </button>
          )}
        </section>

        <button
          type="button"
          className="comparison-analyze-btn"
          onClick={analyzeAll}
          disabled={loading}
        >
          {loading ? 'Running analysis...' : 'Compare prices'}
        </button>

        {results.length > 0 && (
          <section className="comparison-results" aria-label="Comparison results">
            <h2 className="comparison-results__title">Comparison results</h2>

            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Item</th>
                    <th>Current</th>
                    <th>Fair</th>
                    <th>Position</th>
                    <th>Deviation</th>
                    <th>Surge</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const isBest = bestDeal?.index === index;
                    return (
                      <tr key={index} className={isBest ? 'comparison-table__best' : ''}>
                        <td>{isBest ? 'Best' : index + 1}</td>
                        <td className="comparison-table__title">{result.input?.metadata?.title || `Item ${index + 1}`}</td>
                        <td>{formatCurrency(result.currentPrice)}</td>
                        <td className="comparison-table__fair">{formatCurrency(result.fairPrice)}</td>
                        <td>
                          <span style={{ color: getPositionColor(result.pricePosition) }}>
                            {getPositionEmoji(result.pricePosition)} {result.pricePosition}
                          </span>
                        </td>
                        <td className={result.priceDeviation > 0 ? 'deviation--over' : 'deviation--under'}>
                          {result.priceDeviation > 0 ? '+' : ''}{result.priceDeviation}%
                        </td>
                        <td>{result.surgeDetected ? 'Yes' : 'No'}</td>
                        <td>{result.confidenceScore}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {bestDeal && (
              <div className="comparison-winner">
                <h3>
                  Best value: {results[bestDeal.index]?.input?.metadata?.title || `Item ${bestDeal.index + 1}`}
                </h3>
                <p>
                  Lowest deviation from fair baseline at {bestDeal.deviation}%.
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default ComparisonPage;
