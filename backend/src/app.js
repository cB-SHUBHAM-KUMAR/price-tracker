/**
 * @fileoverview Express application setup — middleware pipeline, route
 * mounting, and global error handling. Separated from server.js so the
 * app instance can be imported by tests without starting a listener.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const hpp = require('hpp');

const config = require('./config');
const { globalErrorHandler } = require('./middlewares/error.middleware');
const { notFoundHandler } = require('./middlewares/notFound.middleware');
const { requestIdMiddleware } = require('./middlewares/requestId.middleware');
const { rateLimiter } = require('./middlewares/rateLimiter.middleware');
const logger = require('./config/logger.config');

// ─── API Version Routers ─────────────────────────────────────────────────────
const v1Router = require('./api/v1');
// const v2Router = require('./api/v2'); // Future versions

const app = express();

// ─── Security Middlewares ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(config.cors));
app.use(hpp());

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use(requestIdMiddleware);
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use('/api', rateLimiter);

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1', v1Router);
// app.use('/api/v2', v2Router); // Mount future versions here

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;
