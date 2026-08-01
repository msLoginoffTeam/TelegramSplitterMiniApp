import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PlatformProvider } from '@/app/providers/PlatformProvider';
import { queryClient } from '@/app/providers/queryClient';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>{children}</PlatformProvider>
    </QueryClientProvider>
  );
}
