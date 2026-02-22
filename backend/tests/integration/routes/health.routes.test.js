/**
 * @fileoverview Example integration test for user routes.
 */

const request = require('supertest');
const app = require('../../../src/app');

describe('GET /api/v1/health', () => {
  it('should return 200 with server status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });
});
