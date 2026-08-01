import { z } from 'zod';

const runtimeConfigSchema = z.object({
  VITE_API_BASE_URL: z.url().optional(),
});

export type RuntimeConfig = {
  apiBaseUrl: string;
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

  return {
    apiBaseUrl: parsed.data.VITE_API_BASE_URL ?? '/api',
  };
}
