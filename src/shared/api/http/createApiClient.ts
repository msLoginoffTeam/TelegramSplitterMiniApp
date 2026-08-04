import axios, { type AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/http/ApiError';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';

export interface CreateApiClientOptions {
  baseURL?: string;
  getAuthPayload?: () => string | undefined;
  getDevelopmentUserId?: () => string | undefined;
}

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL ?? getRuntimeConfig().apiBaseUrl,
  });

  client.interceptors.request.use((request) => {
    const authPayload = options.getAuthPayload?.();

    if (authPayload) {
      request.headers.set('X-Telegram-Init-Data', authPayload);
    } else {
      const developmentUserId = options.getDevelopmentUserId?.();

      if (developmentUserId) {
        request.headers.set('X-Telegram-Dev-User-Id', developmentUserId);
      }
    }

    return request;
  });

  client.interceptors.response.use(undefined, (error: unknown) =>
    Promise.reject(toApiError(error)),
  );

  return client;
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return new ApiError(
      error.response?.data?.message ?? error.message,
      error.response?.status,
      error.response?.data,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('An unknown API error occurred.');
}
