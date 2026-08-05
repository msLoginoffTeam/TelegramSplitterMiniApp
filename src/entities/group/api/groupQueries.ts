import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/entities/group/api/groupApi';

export const groupQueryKeys = {
  all: ['groups'] as const,
  mine: () => [...groupQueryKeys.all, 'mine'] as const,
  detail: (groupId: string) => [...groupQueryKeys.all, 'detail', groupId] as const,
};

export function useMyGroupsQuery(enabled: boolean) {
  return useQuery({
    queryKey: groupQueryKeys.mine(),
    queryFn: () => groupApi.getMyGroups(),
    enabled,
  });
}

export function useGroupDashboardQuery(groupId: string, enabled: boolean) {
  return useQuery({
    queryKey: groupQueryKeys.detail(groupId),
    queryFn: () => groupApi.getDashboard(groupId),
    enabled,
    refetchOnMount: 'always',
  });
}
