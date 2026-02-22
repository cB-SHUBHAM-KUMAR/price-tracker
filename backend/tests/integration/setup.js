/**
 * @fileoverview Jest test setup — runs before all integration tests.
 */

const { connectDatabase, disconnectDatabase } = require('../../src/database');

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});
