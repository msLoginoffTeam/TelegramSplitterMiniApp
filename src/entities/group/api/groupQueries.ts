import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/entities/group/api/groupApi';

export const groupQueryKeys = {
  all: ['groups'] as const,
  mine: () => [...groupQueryKeys.all, 'mine'] as const,
};

export function useMyGroupsQuery(enabled: boolean) {
  return useQuery({
    queryKey: groupQueryKeys.mine(),
    queryFn: () => groupApi.getMyGroups(),
    enabled,
  });
}
