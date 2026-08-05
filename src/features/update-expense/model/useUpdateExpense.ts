import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi, type ExpenseWriteInput } from '@/entities/expense';
import { expenseQueryKeys } from '@/entities/expense/api/expenseQueries';
import { groupQueryKeys } from '@/entities/group';

export function useUpdateExpense(groupId: string, expenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseWriteInput) => expenseApi.update(groupId, expenseId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) }),
        queryClient.invalidateQueries({ queryKey: expenseQueryKeys.detail(groupId, expenseId) }),
      ]);
    },
  });
}
