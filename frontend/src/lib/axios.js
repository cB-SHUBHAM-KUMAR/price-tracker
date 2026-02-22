/**
 * @fileoverview Pre-configured Axios instance with interceptors
 * for auth tokens, error handling, and response normalisation.
 */

import axios from 'axios';
import { envConfig } from '../config/env.config';

const api = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — attach auth token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401, normalise errors ────────────────────
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized responses without forcing a global redirect.
    // Pages can decide whether to show inline auth prompts.
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('accessToken');

      if (originalRequest.redirectOnAuthFailure) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
