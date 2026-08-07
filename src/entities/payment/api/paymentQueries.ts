import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/entities/payment/api/paymentApi';

export const paymentQueryKeys = {
  all: ['payments'] as const,
  group: (groupId: string) => [...paymentQueryKeys.all, 'group', groupId] as const,
};

export function useGroupPaymentsQuery(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: paymentQueryKeys.group(groupId),
    queryFn: () => paymentApi.getAll(groupId),
    enabled,
    refetchOnMount: 'always',
  });
}
