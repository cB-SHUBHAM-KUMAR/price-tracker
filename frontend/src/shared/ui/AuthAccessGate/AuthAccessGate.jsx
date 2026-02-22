import { Link, useLocation } from 'react-router-dom';
import './AuthAccessGate.css';

function AuthAccessGate({
  title = 'Sign in required',
  description = 'This section is available after authentication.',
}) {
  const location = useLocation();
  const next = encodeURIComponent(`${location.pathname}${location.search}`);

  return (
    <section className="auth-access-gate" aria-label="Authentication required">
      <p className="auth-access-gate__eyebrow">Account Required</p>
      <h2 className="auth-access-gate__title">{title}</h2>
      <p className="auth-access-gate__description">{description}</p>

      <div className="auth-access-gate__actions">
        <Link to={`/login?next=${next}`} className="auth-access-gate__btn auth-access-gate__btn--primary">
          Sign In
        </Link>
        <Link to={`/register?next=${next}`} className="auth-access-gate__btn auth-access-gate__btn--secondary">
          Register
        </Link>
      </div>
    </section>
  );
}

export default AuthAccessGate;
