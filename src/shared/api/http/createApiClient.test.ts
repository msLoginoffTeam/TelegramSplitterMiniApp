import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { createApiClient } from '@/shared/api/http/createApiClient';

describe('createApiClient', () => {
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
});
