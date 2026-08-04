import { describe, expect, it } from 'vitest';
import { getGeneratedApiBaseUrl, getRuntimeConfig } from '@/shared/config/runtimeConfig';

describe('getRuntimeConfig', () => {
  it('uses /api when API URL is not provided', () => {
    expect(getRuntimeConfig({})).toEqual({ apiBaseUrl: '/api' });
  });

  it('accepts a same-origin API path', () => {
    expect(getRuntimeConfig({ VITE_API_BASE_URL: '/api' })).toEqual({ apiBaseUrl: '/api' });
  });

  it('accepts a local development Telegram user ID', () => {
    expect(getRuntimeConfig({ VITE_DEV_TELEGRAM_USER_ID: '123456' })).toEqual({
      apiBaseUrl: '/api',
      developmentTelegramUserId: '123456',
    });
  });

  it('removes the API path before configuring the generated client', () => {
    expect(getGeneratedApiBaseUrl('/api')).toBe('');
    expect(getGeneratedApiBaseUrl('https://api.example.com/api')).toBe('https://api.example.com');
  });

  it('rejects an invalid API URL', () => {
    expect(() => getRuntimeConfig({ VITE_API_BASE_URL: 'not a URL' })).toThrow(
      'Invalid runtime configuration',
    );
  });
});
