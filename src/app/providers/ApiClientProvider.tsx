import { useMemo, type PropsWithChildren } from 'react';
import { usePlatform } from '@/app/providers/PlatformProvider';
import { configureGeneratedApiClient } from '@/shared/api/http';
import { getRuntimeConfig } from '@/shared/config/runtimeConfig';

export function ApiClientProvider({ children }: PropsWithChildren) {
  const platform = usePlatform();

  useMemo(
    () =>
      configureGeneratedApiClient({
        getAuthPayload: () => platform.getInitData(),
        getDevelopmentUserId: () =>
          platform.kind === 'browser' ? getRuntimeConfig().developmentTelegramUserId : undefined,
      }),
    [platform],
  );

  return children;
}
