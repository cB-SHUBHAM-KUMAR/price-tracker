import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Icons = {
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  x: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { path: '/', label: 'Home', end: true },
  { path: '/price-checker', label: 'Analyzer' },
  { path: '/comparison', label: 'Compare' },
  { path: '/multi-search', label: 'Multi-Search' },
  { path: '/alerts', label: 'Alerts' },
  { path: '/history', label: 'History' },
  { path: '/dashboard', label: 'Dashboard' },
];

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="top-navbar">
        <div className="top-navbar__inner">
          <NavLink to="/" className="top-navbar__brand" onClick={closeMobile}>
            <span className="brand-mark">P</span>
            <span className="brand-text">PriceFair</span>
          </NavLink>

          <nav className="top-navbar__nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `top-navbar__link ${isActive ? 'top-navbar__link--active' : ''}`
                }
                onClick={closeMobile}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="top-navbar__actions">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? Icons.sun : Icons.moon}
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? Icons.x : Icons.menu}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-dropdown ${mobileOpen ? 'mobile-dropdown--open' : ''}`}>
        <nav className="mobile-dropdown__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `mobile-dropdown__link ${isActive ? 'mobile-dropdown__link--active' : ''}`
              }
              onClick={closeMobile}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

export default Navbar;
