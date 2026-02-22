/**
 * @fileoverview Auth service - higher-level auth helpers.
 */

import authApi from '../api/auth.api';

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getStoredToken = () => localStorage.getItem('accessToken');

export const removeStoredToken = () => localStorage.removeItem('accessToken');

export const login = async (credentials) => {
  const response = await authApi.login(credentials);
  const data = response?.data || {};
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  return data;
};

export const register = async (payload) => {
  const response = await authApi.register(payload);
  const data = response?.data || {};
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  return data;
};

export const logout = async () => {
  try {
    await authApi.logout();
  } finally {
    removeStoredToken();
  }
};

const authService = {
  login,
  register,
  logout,
  isTokenExpired,
  getStoredToken,
  removeStoredToken,
};

export default authService;
