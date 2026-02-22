import { useEffect, useState } from 'react';
import { getConfidenceLabel } from '../services/priceFormatter';
import './ConfidenceMeter.css';

function ConfidenceMeter({ score, breakdown }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (animatedScore / 100) * circumference;
  const confidenceLabel = getConfidenceLabel(score);

  const getColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="confidence-meter">
      <h4 className="confidence-meter__title">Confidence Score</h4>

      <div className="confidence-meter__gauge">
        <svg viewBox="0 0 120 120" className="confidence-meter__svg">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="confidence-meter__progress"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="confidence-meter__value">
          <span className="confidence-meter__number" style={{ color: getColor() }}>
            {animatedScore}
          </span>
          <span className="confidence-meter__label">{confidenceLabel}</span>
        </div>
      </div>

      {breakdown && (
        <div className="confidence-meter__breakdown">
          {Object.entries(breakdown).map(([key, value]) => (
            <div className="confidence-breakdown-item" key={key}>
              <span className="confidence-breakdown-item__label">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="confidence-breakdown-item__bar">
                <div
                  className="confidence-breakdown-item__fill"
                  style={{ width: `${value}%`, background: getColor() }}
                />
              </div>
              <span className="confidence-breakdown-item__value">{value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConfidenceMeter;
