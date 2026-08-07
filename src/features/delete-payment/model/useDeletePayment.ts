import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseQueryKeys } from '@/entities/expense/api/expenseQueries';
import { groupQueryKeys } from '@/entities/group';
import { paymentApi, paymentQueryKeys, type Payment } from '@/entities/payment';

export function useDeletePayment(groupId: string, payment: Payment) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => paymentApi.remove(groupId, payment.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentQueryKeys.group(groupId) }),
        queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) }),
        payment.expenseId
          ? queryClient.invalidateQueries({
              queryKey: expenseQueryKeys.detail(groupId, payment.expenseId),
            })
          : Promise.resolve(),
      ]);
    },
  });
}
