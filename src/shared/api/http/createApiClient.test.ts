import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { createApiClient } from '@/shared/api/http/createApiClient';

describe('createApiClient', () => {
  it('limits a stalled request to 15 seconds', () => {
    const client = createApiClient();

    expect(client.defaults.timeout).toBe(15_000);
  });

  it('injects Telegram init data through the supplied callback', async () => {
    const client = createApiClient({ getAuthPayload: () => 'signed-init-data' });
    let capturedRequest: InternalAxiosRequestConfig | undefined;

    const adapter: AxiosAdapter = async (request) => {
      capturedRequest = request;
      return {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: request,
      };
    };

    client.defaults.adapter = adapter;
    await client.get('/health');

    expect(capturedRequest?.headers.get('X-Telegram-Init-Data')).toBe('signed-init-data');
  });

  it('uses a development identity only when Telegram init data is unavailable', async () => {
    const client = createApiClient({ getDevelopmentUserId: () => '123456' });
    let capturedRequest: InternalAxiosRequestConfig | undefined;

    const adapter: AxiosAdapter = async (request) => {
      capturedRequest = request;
      return {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: request,
      };
    };

    client.defaults.adapter = adapter;
    await client.get('/health');

    expect(capturedRequest?.headers.get('X-Telegram-Dev-User-Id')).toBe('123456');
    expect(capturedRequest?.headers.get('X-Telegram-Init-Data')).toBeUndefined();
  });
});
