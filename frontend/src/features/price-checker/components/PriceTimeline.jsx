import './PriceTimeline.css';

function PriceTimeline({ timeline, type }) {
  if (!timeline || !timeline.monthlyTrend) return null;

  const { monthLabels, monthlyTrend, bestMonths, peakMonths, tips } = timeline;
  const max = Math.max(...monthlyTrend);
  const min = Math.min(...monthlyTrend);
  const currentMonth = new Date().getMonth();

  const getBarColor = (value, index) => {
    const monthName = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ][index];
    if (bestMonths.includes(monthName)) return 'var(--timeline-best, #22c55e)';
    if (peakMonths.includes(monthName)) return 'var(--timeline-peak, #ef4444)';
    return 'var(--timeline-normal, rgba(99, 102, 241, 0.6))';
  };

  const typeLabel = type === 'flight' ? '✈️ Flights' : type === 'hotel' ? '🏨 Hotels' : '📦 Products';

  return (
    <div className="price-timeline">
      <h4 className="price-timeline__title">📅 Best Time to Buy — {typeLabel}</h4>

      <div className="price-timeline__chart">
        {monthlyTrend.map((value, i) => {
          const height = max === min ? 50 : ((value - min) / (max - min)) * 75 + 25;
          const isCurrent = i === currentMonth;
          return (
            <div key={i} className={`timeline-bar-wrapper ${isCurrent ? 'timeline-bar-wrapper--current' : ''}`}>
              <span className="timeline-bar__value">{value}</span>
              <div
                className="timeline-bar"
                style={{
                  height: `${height}%`,
                  background: getBarColor(value, i),
                }}
                title={`${monthLabels[i]}: Price Index ${value}`}
              />
              <span className="timeline-bar__label">{monthLabels[i]}</span>
              {isCurrent && <span className="timeline-bar__now">NOW</span>}
            </div>
          );
        })}
      </div>

      <div className="price-timeline__legend">
        <span className="timeline-legend-item">
          <span className="timeline-dot timeline-dot--best" /> Best Months
        </span>
        <span className="timeline-legend-item">
          <span className="timeline-dot timeline-dot--peak" /> Peak Prices
        </span>
        <span className="timeline-legend-item">
          <span className="timeline-dot timeline-dot--normal" /> Average
        </span>
      </div>

      <div className="price-timeline__tips">
        <h5 className="tips__title">💡 Buying Tips</h5>
        <ul className="tips__list">
          {tips.slice(0, 3).map((tip, i) => (
            <li key={i} className="tips__item">{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PriceTimeline;
