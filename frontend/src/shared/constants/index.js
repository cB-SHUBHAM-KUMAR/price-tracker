/**
 * @fileoverview Shared constants — API endpoints, app-wide values.
 */

export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  USERS: '/users',
  DASHBOARD: '/dashboard',
});

export const APP_NAME = 'Dynamic Price Checker';

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
});
