/**
 * @fileoverview MongoDB connection setup using Mongoose.
 */

const mongoose = require('mongoose');
const logger = require('../config/logger.config');
const dbConfig = require('../config/db.config');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', { error: error.message });
    throw error;
  }
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully.');
};

module.exports = { connectDatabase, disconnectDatabase };
