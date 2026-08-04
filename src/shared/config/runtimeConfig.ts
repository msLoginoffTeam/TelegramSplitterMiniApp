import { z } from 'zod';

const apiBaseUrlSchema = z.union([z.url(), z.string().startsWith('/')]);

const runtimeConfigSchema = z.object({
  VITE_API_BASE_URL: apiBaseUrlSchema.optional(),
  VITE_DEV_TELEGRAM_USER_ID: z.string().regex(/^\d+$/).optional(),
});

export type RuntimeConfig = {
  apiBaseUrl: string;
  developmentTelegramUserId?: string;
};

export function getRuntimeConfig(
  env: Record<string, string | undefined> = import.meta.env,
): RuntimeConfig {
  const parsed = runtimeConfigSchema.safeParse(env);

  if (!parsed.success) {
    throw new Error(
      `Invalid runtime configuration: ${parsed.error.issues[0]?.message ?? 'unknown error'}`,
    );
  }

  const config: RuntimeConfig = {
    apiBaseUrl: parsed.data.VITE_API_BASE_URL ?? '/api',
  };

  if (parsed.data.VITE_DEV_TELEGRAM_USER_ID) {
    config.developmentTelegramUserId = parsed.data.VITE_DEV_TELEGRAM_USER_ID;
  }

  return config;
}

export function getGeneratedApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -'/api'.length) : apiBaseUrl;
}
