/**
 * @fileoverview Route configuration — single source of truth for all
 * route paths. Import from here instead of hardcoding strings.
 */

export const ROUTES = Object.freeze({
  HOME: '/',
  PRICE_CHECKER: '/price-checker',
  ALERTS: '/alerts',
  HISTORY: '/history',
  COMPARISON: '/comparison',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
});

export default ROUTES;
