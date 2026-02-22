// Auth feature tests
import { describe, it, expect } from 'vitest';

describe('Auth Feature', () => {
  it('should export auth service functions', async () => {
    const authService = await import('../services/auth.service');
    expect(authService.default).toBeDefined();
    expect(typeof authService.default.login).toBe('function');
    expect(typeof authService.default.register).toBe('function');
    expect(typeof authService.default.logout).toBe('function');
  });

  it('should export auth API functions', async () => {
    const authApi = await import('../api/auth.api');
    expect(authApi.default).toBeDefined();
  });
});
