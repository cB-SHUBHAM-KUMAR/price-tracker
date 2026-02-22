/**
 * @fileoverview Centralized configuration — reads from environment variables
 * and exposes a single frozen config object for the entire application.
 */

const dotenv = require('dotenv');
const path = require('path');

// Load the correct .env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });
dotenv.config({ path: path.resolve(__dirname, '../../', '.env') }); // fallback

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // ─── Database ────────────────────────────────────────────────────────
  db: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/dynamic-price-checker',
    options: {
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE, 10) || 10,
    },
  },

  // ─── JWT ─────────────────────────────────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // ─── CORS ────────────────────────────────────────────────────────────
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },

  // ─── Rate Limiting ──────────────────────────────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // ─── OpenAI ──────────────────────────────────────────────────────────
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  },

  // ─── Logging ─────────────────────────────────────────────────────────
  log: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || 'logs',
  },
};

module.exports = Object.freeze(config);
