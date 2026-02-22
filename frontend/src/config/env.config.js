/**
 * @fileoverview Environment configuration — single source of truth
 * for all environment-dependent values.
 */

export const envConfig = Object.freeze({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  appName: import.meta.env.VITE_APP_NAME || 'Dynamic Price Checker',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
});

export default envConfig;
