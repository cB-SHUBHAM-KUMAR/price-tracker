/**
 * @fileoverview Server entry point — bootstraps the application and handles
 * graceful shutdown. Keep this file thin; all Express setup lives in app.js.
 */

const app = require('./app');
const config = require('./config');
const logger = require('./config/logger.config');
const { connectDatabase } = require('./database');
const alertScheduler = require('./schedulers/alertScheduler');

// ─── Uncaught Exception Handler ──────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION 💥 Shutting down...', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // 1. Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // 2. Start listening
    const server = app.listen(config.port, () => {
      logger.info(`Server running in [${config.env}] mode on port ${config.port}`);
    });

    // 3. Start alert scheduler (cron)
    alertScheduler.start();

    // ─── Unhandled Rejection Handler ───────────────────────────────────
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION 💥 Shutting down...', {
        error: err.message,
        stack: err.stack,
      });
      server.close(() => process.exit(1));
    });

    // ─── Graceful Shutdown ─────────────────────────────────────────────
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        alertScheduler.stop();
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown — could not close connections in time.');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
};

startServer();
