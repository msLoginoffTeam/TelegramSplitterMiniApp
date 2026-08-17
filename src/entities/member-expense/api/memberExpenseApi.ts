import {
  MemberExpenseInvolvement as ApiInvolvement,
  MemberExpenseResponseDto,
} from '@/shared/api/generated/client';
import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type {
  MemberExpense,
  MemberExpenseInvolvement,
} from '@/entities/member-expense/model/types';

const apiInvolvement: Record<MemberExpenseInvolvement, ApiInvolvement> = {
  all: ApiInvolvement._0,
  payer: ApiInvolvement._1,
  participant: ApiInvolvement._2,
};

function toMemberExpense(response: MemberExpenseResponseDto): MemberExpense {
  if (
    !response.id ||
    !response.title ||
    response.totalAmount === undefined ||
    !response.payerId ||
    !response.createdAt
  ) {
    throw new Error('Backend returned an incomplete member expense.');
  }

  return {
    id: response.id,
    title: response.title,
    description: response.description ?? undefined,
    totalAmount: response.totalAmount,
    payerId: response.payerId,
    payerName: response.payerName ?? 'Участник',
    payerUsername: response.payerUsername ?? undefined,
    createdAt: response.createdAt,
    isDraft: response.isDraft ?? false,
    isPayer: response.isPayer ?? false,
    shareAmount: response.shareAmount ?? undefined,
    paidAmount: response.paidAmount ?? undefined,
    overpaymentAmount: response.overpaymentAmount ?? undefined,
    isPaid: response.isPaid ?? undefined,
    isPaidByPayments: response.isPaidByPayments ?? undefined,
    isManuallySettled: response.isManuallySettled ?? undefined,
  };
}

export const memberExpenseApi = {
  async getAll(groupId: string, userId: string, involvement: MemberExpenseInvolvement) {
    const response = await GeneratedClient.expensesAll2(
      groupId,
      userId,
      apiInvolvement[involvement],
    );
    return response.map(toMemberExpense);
  },
};
