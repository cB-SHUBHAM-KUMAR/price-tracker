import { formatCurrency, getPositionColor, getPositionEmoji } from '../services/priceFormatter';
import { exportAnalysisAsPDF } from '../services/pdfExport';
import SurgeIndicator from './SurgeIndicator';
import ConfidenceMeter from './ConfidenceMeter';
import PriceTimeline from './PriceTimeline';
import './ResultCard.css';

function ResultCard({ data, onReset }) {
  const positionColor = getPositionColor(data.pricePosition);
  const positionEmoji = getPositionEmoji(data.pricePosition);

  return (
    <div className="result-card animate-in">
      {/* ─── Header Badge ──────────────────────────────────────────────── */}
      <div className="result-card__badge" style={{ background: positionColor }}>
        <span className="result-card__badge-emoji">{positionEmoji}</span>
        <span className="result-card__badge-text">{data.pricePosition}</span>
      </div>

      {/* ─── Price Comparison ──────────────────────────────────────────── */}
      <div className="result-card__prices">
        <div className="result-price result-price--current">
          <span className="result-price__label">Current Price</span>
          <span className="result-price__value">{formatCurrency(data.currentPrice)}</span>
        </div>
        <div className="result-price__divider">
          <span className="result-price__vs">VS</span>
        </div>
        <div className="result-price result-price--fair">
          <span className="result-price__label">Fair Price</span>
          <span className="result-price__value">{formatCurrency(data.fairPrice)}</span>
        </div>
      </div>

      <div className="result-card__range">
        <span>Fair Range:</span>
        <strong> {formatCurrency(data.fairPriceRange.min)} — {formatCurrency(data.fairPriceRange.max)}</strong>
      </div>

      {/* ─── Reference Data Badge ──────────────────────────────────────── */}
      {data.referenceMatch && (
        <div className="result-card__reference-badge">
          <span className="reference-badge__icon">📊</span>
          <span className="reference-badge__text">
            Verified against market data
            {data.referenceMatch.matchedKey && ` — matched "${data.referenceMatch.matchedKey}"`}
            {data.referenceMatch.matchedLocation && ` — ${data.referenceMatch.matchedLocation} rates`}
            {data.referenceMatch.matchedRoute && ` — ${data.referenceMatch.matchedRoute} route`}
          </span>
        </div>
      )}

      {/* ─── Recommendation Card ───────────────────────────────────────── */}
      <div className="result-card__recommendation">
        <div className="recommendation__icon">💡</div>
        <div className="recommendation__content">
          <h4 className="recommendation__title">Recommendation</h4>
          <p className="recommendation__text">{data.buyRecommendation}</p>
        </div>
      </div>

      {/* ─── Surge + Confidence Grid ───────────────────────────────────── */}
      <div className="result-card__grid">
        <SurgeIndicator
          surgeDetected={data.surgeDetected}
          surgeLevel={data.surgeLevel}
          dynamicScore={data.dynamicScore}
          priceDeviation={data.priceDeviation}
        />
        <ConfidenceMeter
          score={data.confidenceScore}
          breakdown={data.confidenceBreakdown}
        />
      </div>

      {/* ─── Demand Signals ────────────────────────────────────────────── */}
      {data.demandSignals && data.demandSignals.length > 0 && (
        <div className="result-card__signals">
          <h4 className="signals__title">📊 Demand Signals</h4>
          <div className="signals__list">
            {data.demandSignals.map((signal, i) => (
              <span key={i} className="signal-tag">{signal}</span>
            ))}
          </div>
        </div>
      )}

      {/* ─── AI Reasoning ──────────────────────────────────────────────── */}
      <div className="result-card__reasoning">
        <h4 className="reasoning__title">🤖 AI Reasoning</h4>
        <div className="reasoning__text">
          {data.reasoningSummary.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      {/* ─── Historical Mini Chart ─────────────────────────────────────── */}
      {data.historicalPrices && (
        <div className="result-card__chart">
          <h4 className="chart__title">📈 30-Day Price Trend Estimate</h4>
          <div className="chart__bars">
            {(() => {
              const max = Math.max(...data.historicalPrices);
              const min = Math.min(...data.historicalPrices);
              return data.historicalPrices.map((p, i) => {
                const height = max === min ? 50 : ((p - min) / (max - min)) * 80 + 20;
                const isAboveFair = p > data.fairPrice;
                return (
                  <div
                    key={i}
                    className="chart__bar"
                    style={{
                      height: `${height}%`,
                      background: isAboveFair
                        ? 'rgba(239, 68, 68, 0.6)'
                        : 'rgba(99, 102, 241, 0.6)',
                    }}
                    title={`Day ${i + 1}: ${formatCurrency(p)}`}
                  />
                );
              });
            })()}
          </div>
          <div className="chart__legend">
            <span className="chart__legend-item"><span className="chart__dot chart__dot--fair" /> Below Fair</span>
            <span className="chart__legend-item"><span className="chart__dot chart__dot--above" /> Above Fair</span>
          </div>
        </div>
      )}

      {/* ─── Price Timeline (Best Time to Buy) ─────────────────────────── */}
      {data.priceTimeline && (
        <PriceTimeline
          timeline={data.priceTimeline}
          type={data.input?.type || 'product'}
        />
      )}

      {/* ─── Actions ──────────────────────────────────────────────────── */}
      <div className="result-card__actions">
        <button className="result-card__reset" onClick={onReset}>
          ← Analyze Another Price
        </button>
        <button className="result-card__export" onClick={() => exportAnalysisAsPDF(data)}>
          📄 Download Report
        </button>
      </div>
    </div>
  );
}

export default ResultCard;
