import './AlertList.css';

const STATUS_LABELS = {
  active: 'Active',
  triggered: 'Triggered',
  paused: 'Paused',
  expired: 'Expired',
};

function AlertList({ alerts, onToggle, onDelete, loading }) {
  if (loading) {
    return <div className="alert-list__loading">Loading alerts...</div>;
  }

  if (!alerts.length) {
    return <div className="alert-list__empty">No alerts yet. Create your first tracker rule.</div>;
  }

  return (
    <section className="alert-list" aria-label="Your alerts">
      <header className="alert-list__header">
        <h2 className="alert-list__title">Your alerts</h2>
        <span className="alert-list__count">{alerts.length}</span>
      </header>

      <div className="alert-list__grid">
        {alerts.map((alert) => {
          const canToggle = alert.status !== 'triggered' && alert.status !== 'expired';

          return (
            <article key={alert._id} className={`alert-card alert-card--${alert.status}`}>
              <div className="alert-card__header">
                <h3 className="alert-card__title">{alert.title}</h3>
                <span className={`alert-card__status alert-card__status--${alert.status}`}>
                  {STATUS_LABELS[alert.status] || alert.status}
                </span>
              </div>

              <dl className="alert-card__meta">
                <div>
                  <dt>Type</dt>
                  <dd>{alert.type}</dd>
                </div>
                <div>
                  <dt>Rule</dt>
                  <dd>{alert.condition} {alert.currency} {alert.targetPrice?.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>Last check</dt>
                  <dd>{alert.lastCheckedPrice ? `${alert.currency} ${alert.lastCheckedPrice.toLocaleString()}` : 'No data yet'}</dd>
                </div>
                <div>
                  <dt>Tracking URL</dt>
                  <dd>{alert.trackingUrl ? 'Configured' : 'Not configured'}</dd>
                </div>
              </dl>

              <div className="alert-card__actions">
                <button
                  type="button"
                  className="alert-action"
                  onClick={() => onToggle(alert._id)}
                  disabled={!canToggle}
                >
                  {alert.status === 'paused' ? 'Resume' : 'Pause'}
                </button>

                <button
                  type="button"
                  className="alert-action alert-action--danger"
                  onClick={() => onDelete(alert._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AlertList;
