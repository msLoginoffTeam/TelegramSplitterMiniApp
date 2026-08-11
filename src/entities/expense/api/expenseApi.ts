import {
  CreateExpenseRequestDto,
  ExpenseResponseDto,
  ExpenseShareCreateDto,
  UpdateExpenseShareSettlementRequestDto,
  UpdateExpenseRequestDto,
} from '@/shared/api/generated/client';
import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type { Expense, ExpenseWriteInput } from '@/entities/expense/model/types';

function toExpense(response: ExpenseResponseDto): Expense {
  if (
    !response.id ||
    !response.title ||
    response.totalAmount === undefined ||
    !response.payerId ||
    !response.createdByUserId ||
    !response.createdAt
  ) {
    throw new Error('Backend returned an incomplete expense.');
  }

  return {
    id: response.id,
    title: response.title,
    description: response.description ?? undefined,
    totalAmount: response.totalAmount,
    payerId: response.payerId,
    payerName: response.payerName ?? 'Участник',
    payerUsername: response.payerUsername ?? undefined,
    createdByUserId: response.createdByUserId,
    createdAt: response.createdAt,
    isDraft: response.isDraft ?? false,
    shares: (response.shares ?? []).map((share) => ({
      userId: share.userId ?? '',
      displayName: share.displayName ?? 'Участник',
      username: share.username ?? undefined,
      amount: share.amount ?? 0,
      paidAmount: share.paidAmount ?? 0,
      overpaymentAmount: share.overpaymentAmount ?? 0,
      isPaid: share.isPaid ?? false,
      isPaidByPayments: share.isPaidByPayments ?? false,
      isManuallySettled: share.isManuallySettled ?? false,
    })),
  };
}

function toShares(input: ExpenseWriteInput) {
  return input.shares
    .filter((share) => share.amount > 0)
    .map((share) => new ExpenseShareCreateDto(share));
}

export const expenseApi = {
  async create(groupId: string, input: ExpenseWriteInput) {
    const response = await GeneratedClient.expensesPOST(
      groupId,
      new CreateExpenseRequestDto({
        title: input.title,
        description: input.description,
        totalAmount: input.totalAmount,
        payerId: input.payerId,
        shares: toShares(input),
      }),
    );
    return toExpense(response);
  },

  async get(groupId: string, expenseId: string) {
    return toExpense(await GeneratedClient.expensesGET(groupId, expenseId));
  },

  async update(groupId: string, expenseId: string, input: ExpenseWriteInput) {
    const response = await GeneratedClient.expensesPUT(
      groupId,
      expenseId,
      new UpdateExpenseRequestDto({
        title: input.title,
        description: input.description,
        totalAmount: input.totalAmount,
        payerId: input.payerId,
        shares: toShares(input),
      }),
    );
    return toExpense(response);
  },

  remove(groupId: string, expenseId: string) {
    return GeneratedClient.expensesDELETE(groupId, expenseId);
  },

  async updateShareSettlement(
    groupId: string,
    expenseId: string,
    userId: string,
    isManuallySettled: boolean,
  ) {
    return toExpense(
      await GeneratedClient.settlement(
        groupId,
        expenseId,
        userId,
        new UpdateExpenseShareSettlementRequestDto({ isManuallySettled }),
      ),
    );
  },
};
