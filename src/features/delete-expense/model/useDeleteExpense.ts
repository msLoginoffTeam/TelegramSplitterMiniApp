import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/entities/expense';
import { expenseQueryKeys } from '@/entities/expense/api/expenseQueries';
import { groupQueryKeys } from '@/entities/group';

export function useDeleteExpense(groupId: string, expenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => expenseApi.remove(groupId, expenseId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: expenseQueryKeys.detail(groupId, expenseId) });
      await queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) });
    },
  });
}
