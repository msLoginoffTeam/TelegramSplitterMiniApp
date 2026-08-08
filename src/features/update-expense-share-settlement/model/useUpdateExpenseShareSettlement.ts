import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/entities/expense';
import { expenseQueryKeys } from '@/entities/expense/api/expenseQueries';

type UpdateExpenseShareSettlementInput = {
  userId: string;
  isManuallySettled: boolean;
};

export function useUpdateExpenseShareSettlement(groupId: string, expenseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isManuallySettled }: UpdateExpenseShareSettlementInput) =>
      expenseApi.updateShareSettlement(groupId, expenseId, userId, isManuallySettled),
    onSuccess: (expense) =>
      queryClient.setQueryData(expenseQueryKeys.detail(groupId, expenseId), expense),
  });
}
