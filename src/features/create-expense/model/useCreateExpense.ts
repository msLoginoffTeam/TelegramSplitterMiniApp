import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi, type ExpenseWriteInput } from '@/entities/expense';
import { groupQueryKeys } from '@/entities/group';

export function useCreateExpense(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseWriteInput) => expenseApi.create(groupId, input),
    onSuccess: async () =>
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) }),
  });
}
