import './SurgeIndicator.css';

function SurgeIndicator({ surgeDetected, surgeLevel, dynamicScore, priceDeviation }) {
  const normalizedLevel = surgeLevel || 'none';

  return (
    <div className={`surge-indicator ${surgeDetected ? 'surge-indicator--active' : 'surge-indicator--safe'}`}>
      <div className="surge-indicator__header">
        <span className="surge-indicator__icon" />
        <h4 className="surge-indicator__title">
          {surgeDetected ? 'Surge Pricing Detected' : 'No Surge Detected'}
        </h4>
      </div>

      <div className="surge-indicator__bar-track">
        <div
          className="surge-indicator__bar-fill"
          style={{ width: `${Math.round((dynamicScore || 0) * 100)}%` }}
        />
      </div>

      <div className="surge-indicator__details">
        <div className="surge-detail">
          <span className="surge-detail__label">Dynamic Score</span>
          <span className="surge-detail__value">{((dynamicScore || 0) * 100).toFixed(0)}%</span>
        </div>
        <div className="surge-detail">
          <span className="surge-detail__label">Level</span>
          <span className={`surge-detail__badge surge-detail__badge--${normalizedLevel}`}>
            {normalizedLevel}
          </span>
        </div>
        <div className="surge-detail">
          <span className="surge-detail__label">Deviation</span>
          <span className="surge-detail__value">{priceDeviation > 0 ? '+' : ''}{priceDeviation}%</span>
        </div>
      </div>
    </div>
  );
}

export default SurgeIndicator;
