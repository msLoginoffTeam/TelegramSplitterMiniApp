import type { AxiosInstance } from 'axios';
import { setAxiosFactory, setBaseUrl } from '@/shared/api/generated/client';
import { getGeneratedApiBaseUrl, getRuntimeConfig } from '@/shared/config/runtimeConfig';
import { createApiClient, type CreateApiClientOptions } from '@/shared/api/http/createApiClient';

export function configureGeneratedApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const { apiBaseUrl } = getRuntimeConfig();
  const generatedApiBaseUrl = getGeneratedApiBaseUrl(apiBaseUrl);
  const client = createApiClient({ ...options, baseURL: generatedApiBaseUrl });

  setBaseUrl(generatedApiBaseUrl);
  setAxiosFactory(() => client);

  return client;
}
