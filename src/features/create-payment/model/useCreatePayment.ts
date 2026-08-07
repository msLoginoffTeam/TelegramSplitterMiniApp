import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi, paymentQueryKeys, type CreatePaymentInput } from '@/entities/payment';
import { expenseQueryKeys } from '@/entities/expense/api/expenseQueries';
import { groupQueryKeys } from '@/entities/group';

export function useCreatePayment(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentInput) => paymentApi.create(groupId, input),
    onSuccess: async (_payment, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentQueryKeys.group(groupId) }),
        queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) }),
        input.kind === 'expense'
          ? queryClient.invalidateQueries({
              queryKey: expenseQueryKeys.detail(groupId, input.expenseId),
            })
          : Promise.resolve(),
      ]);
    },
  });
}
