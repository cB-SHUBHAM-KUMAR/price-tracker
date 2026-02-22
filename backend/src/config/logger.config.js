/**
 * @fileoverview Winston logger configuration with daily file rotation
 * and structured JSON format for production environments.
 */

const winston = require('winston');
require('winston-daily-rotate-file');

const config = require('./index');

// ─── Custom log format ──────────────────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// ─── Transports ──────────────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    silent: config.env === 'test',
  }),
];

// File transports only in non-test environments
if (config.env !== 'test') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: `${config.log.directory}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: `${config.log.directory}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    })
  );
}

// ─── Logger Instance ─────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: config.log.level,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
});

module.exports = logger;
