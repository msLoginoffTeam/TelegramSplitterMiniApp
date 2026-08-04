import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PlatformProvider } from '@/app/providers/PlatformProvider';
import { queryClient } from '@/app/providers/queryClient';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>
        <ApiClientProvider>{children}</ApiClientProvider>
      </PlatformProvider>
    </QueryClientProvider>
  );
}
import { ApiClientProvider } from '@/app/providers/ApiClientProvider';
