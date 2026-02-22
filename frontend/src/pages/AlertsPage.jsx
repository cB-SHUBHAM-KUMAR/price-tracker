import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAlerts,
  createAlert,
  removeAlert,
  toggleAlert,
} from '../features/alerts/store/alertsSlice';
import AlertForm from '../features/alerts/components/AlertForm';
import AlertList from '../features/alerts/components/AlertList';
import AuthAccessGate from '../shared/ui/AuthAccessGate/AuthAccessGate';
import './AlertsPage.css';

function AlertsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, loading, error } = useSelector((state) => state.alerts);
  const hasToken = Boolean(localStorage.getItem('accessToken'));
  const canAccessAlerts = isAuthenticated || hasToken;
  const authError = /access token|unauthorized|expired|invalid/i.test(error || '');

  useEffect(() => {
    if (!canAccessAlerts) return;
    dispatch(fetchAlerts());
  }, [dispatch, canAccessAlerts]);

  const stats = useMemo(() => {
    const active = items.filter((item) => item.status === 'active').length;
    const paused = items.filter((item) => item.status === 'paused').length;
    const triggered = items.filter((item) => item.status === 'triggered').length;

    return {
      total: items.length,
      active,
      paused,
      triggered,
    };
  }, [items]);

  return (
    <div className="alerts-page">
      <header className="alerts-page__header">
        <p className="alerts-page__eyebrow">Automated price tracking</p>
        <h1 className="page-heading">
          Price <span className="heading-accent">Alerts</span>
        </h1>
        <p className="page-subheading">
          Configure thresholds and receive notifications when your conditions are met.
        </p>
      </header>

      <main className="alerts-page__content">
        {!canAccessAlerts || authError ? (
          <AuthAccessGate
            title="Sign in to use Alerts"
            description="Create, pause, and track personal price alerts after signing in. Your alerts and email notifications are account-specific."
          />
        ) : (
          <>
            {error && <div className="page-error" role="alert">{error}</div>}

            <section className="alerts-page__stats" aria-label="Alert summary">
              <div className="alerts-stat-card">
                <span className="alerts-stat-card__value">{stats.total}</span>
                <span className="alerts-stat-card__label">Total alerts</span>
              </div>
              <div className="alerts-stat-card">
                <span className="alerts-stat-card__value">{stats.active}</span>
                <span className="alerts-stat-card__label">Active</span>
              </div>
              <div className="alerts-stat-card">
                <span className="alerts-stat-card__value">{stats.paused}</span>
                <span className="alerts-stat-card__label">Paused</span>
              </div>
              <div className="alerts-stat-card">
                <span className="alerts-stat-card__value">{stats.triggered}</span>
                <span className="alerts-stat-card__label">Triggered</span>
              </div>
            </section>

            <section className="alerts-page__workspace">
              <div className="alerts-page__form">
                <AlertForm onSubmit={(data) => dispatch(createAlert(data))} loading={loading} />
              </div>

              <div className="alerts-page__list">
                <AlertList
                  alerts={items}
                  loading={loading}
                  onToggle={(id) => dispatch(toggleAlert(id))}
                  onDelete={(id) => dispatch(removeAlert(id))}
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AlertsPage;
