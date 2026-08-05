import { useQuery } from '@tanstack/react-query';
import { expenseApi } from '@/entities/expense/api/expenseApi';

export const expenseQueryKeys = {
  all: ['expenses'] as const,
  detail: (groupId: string, expenseId: string) =>
    [...expenseQueryKeys.all, 'detail', groupId, expenseId] as const,
};

export function useExpenseQuery(groupId: string, expenseId: string, enabled: boolean) {
  return useQuery({
    queryKey: expenseQueryKeys.detail(groupId, expenseId),
    queryFn: () => expenseApi.get(groupId, expenseId),
    enabled,
  });
}
