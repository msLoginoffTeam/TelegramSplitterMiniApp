import { describe, expect, it } from 'vitest';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';

describe('getRuntimeConfig', () => {
  it('uses /api when API URL is not provided', () => {
    expect(getRuntimeConfig({})).toEqual({ apiBaseUrl: '/api' });
  });

  it('accepts a same-origin API path', () => {
    expect(getRuntimeConfig({ VITE_API_BASE_URL: '/api' })).toEqual({ apiBaseUrl: '/api' });
  });

  it('rejects an invalid API URL', () => {
    expect(() => getRuntimeConfig({ VITE_API_BASE_URL: 'not a URL' })).toThrow(
      'Invalid runtime configuration',
    );
  });
});
