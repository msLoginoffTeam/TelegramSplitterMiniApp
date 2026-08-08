import { useQuery } from '@tanstack/react-query';
import { transferApi } from '@/entities/transfer/api/transferApi';

export const transferQueryKeys = {
  all: ['transfers'] as const,
  group: (groupId: string) => [...transferQueryKeys.all, 'group', groupId] as const,
};

export function useGroupTransfersQuery(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: transferQueryKeys.group(groupId),
    queryFn: () => transferApi.getSuggestions(groupId),
    enabled,
    refetchOnMount: 'always',
  });
}
