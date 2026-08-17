import { useQuery } from '@tanstack/react-query';
import { memberExpenseApi } from '@/entities/member-expense/api/memberExpenseApi';
import type { MemberExpenseInvolvement } from '@/entities/member-expense/model/types';

export const memberExpenseQueryKeys = {
  all: ['member-expenses'] as const,
  list: (groupId: string, userId: string, involvement: MemberExpenseInvolvement) =>
    [...memberExpenseQueryKeys.all, groupId, userId, involvement] as const,
};

export function useMemberExpensesQuery(
  groupId: string,
  userId: string,
  involvement: MemberExpenseInvolvement,
  enabled: boolean,
) {
  return useQuery({
    queryKey: memberExpenseQueryKeys.list(groupId, userId, involvement),
    queryFn: () => memberExpenseApi.getAll(groupId, userId, involvement),
    enabled,
    refetchOnMount: 'always',
  });
}
