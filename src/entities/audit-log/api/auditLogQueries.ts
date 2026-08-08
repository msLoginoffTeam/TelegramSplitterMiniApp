import { useInfiniteQuery } from '@tanstack/react-query';
import { auditLogApi } from '@/entities/audit-log/api/auditLogApi';

export const auditLogQueryKeys = {
  all: ['audit-log'] as const,
  group: (groupId: string) => [...auditLogQueryKeys.all, groupId] as const,
};

export function useGroupAuditLogQuery(groupId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: auditLogQueryKeys.group(groupId),
    queryFn: ({ pageParam }) => auditLogApi.getPage(groupId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (page) => (page.hasMore ? page.nextOffset : undefined),
    enabled,
    refetchOnMount: 'always',
  });
}
