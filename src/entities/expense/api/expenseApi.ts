import { CreateExpenseRequestDto, ExpenseShareCreateDto } from '@/shared/api/generated/client';
import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type { ExpenseWriteInput } from '@/entities/expense/model/types';

export const expenseApi = {
  create(groupId: string, input: ExpenseWriteInput) {
    return GeneratedClient.expensesPOST(
      groupId,
      new CreateExpenseRequestDto({
        title: input.title,
        totalAmount: input.totalAmount,
        payerId: input.payerId,
        isDraft: false,
        shares: input.shares
          .filter((share) => share.userId !== input.payerId)
          .map((share) => new ExpenseShareCreateDto(share)),
      }),
    );
  },
};
