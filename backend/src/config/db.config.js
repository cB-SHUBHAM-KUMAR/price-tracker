/**
 * @fileoverview Database configuration for different environments.
 */

const config = require('./index');

const dbConfig = {
  development: {
    uri: config.db.uri,
    options: {
      ...config.db.options,
      autoIndex: true,
    },
  },
  production: {
    uri: config.db.uri,
    options: {
      ...config.db.options,
      autoIndex: false,
    },
  },
  test: {
    uri: process.env.TEST_DB_URI || 'mongodb://localhost:27017/dynamic-price-checker-test',
    options: {
      ...config.db.options,
      autoIndex: true,
    },
  },
};

module.exports = dbConfig[config.env] || dbConfig.development;
