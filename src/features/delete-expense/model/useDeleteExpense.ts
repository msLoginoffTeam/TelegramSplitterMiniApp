import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/entities/expense';
import { expenseQueryKeys } from '@/entities/expense/api/expenseQueries';
import { auditLogQueryKeys } from '@/entities/audit-log';
import { groupQueryKeys } from '@/entities/group';
import { paymentQueryKeys } from '@/entities/payment';

export function useDeleteExpense(groupId: string, expenseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => expenseApi.remove(groupId, expenseId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: expenseQueryKeys.detail(groupId, expenseId) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) }),
        queryClient.invalidateQueries({ queryKey: paymentQueryKeys.group(groupId) }),
        queryClient.invalidateQueries({ queryKey: auditLogQueryKeys.group(groupId) }),
      ]);
    },
  });
}
