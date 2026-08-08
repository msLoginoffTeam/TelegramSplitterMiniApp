import {
  CreateDirectPaymentRequestDto,
  CreatePaymentForExpenseRequestDto,
  PaymentResponseDto,
} from '@/shared/api/generated/client';
import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type { CreatePaymentInput, Payment } from '@/entities/payment/model/types';

function toPayment(response: PaymentResponseDto): Payment {
  if (
    !response.id ||
    !response.fromUserId ||
    !response.toUserId ||
    !response.createdByUserId ||
    response.amount === undefined ||
    !response.timestamp
  ) {
    throw new Error('Backend returned an incomplete payment.');
  }

  return {
    id: response.id,
    expenseId: response.expenseId ?? undefined,
    fromUserId: response.fromUserId,
    fromDisplayName: response.fromDisplayName ?? 'Участник',
    fromUsername: response.fromUsername ?? undefined,
    toUserId: response.toUserId,
    toDisplayName: response.toDisplayName ?? 'Участник',
    toUsername: response.toUsername ?? undefined,
    createdByUserId: response.createdByUserId,
    amount: response.amount,
    description: response.description ?? undefined,
    timestamp: response.timestamp,
  };
}

export const paymentApi = {
  async getAll(groupId: string): Promise<Payment[]> {
    return (await GeneratedClient.paymentsAll(groupId)).map(toPayment);
  },

  async create(groupId: string, input: CreatePaymentInput): Promise<Payment> {
    if (input.kind === 'expense') {
      return toPayment(
        await GeneratedClient.expense(
          groupId,
          new CreatePaymentForExpenseRequestDto({
            expenseId: input.expenseId,
            fromUserId: input.fromUserId,
            amount: input.amount,
            description: input.description,
          }),
        ),
      );
    }

    return toPayment(
      await GeneratedClient.direct(
        groupId,
        new CreateDirectPaymentRequestDto({
          fromUserId: input.fromUserId,
          toUserId: input.toUserId,
          amount: input.amount,
          description: input.description,
        }),
      ),
    );
  },

  remove(groupId: string, paymentId: string): Promise<void> {
    return GeneratedClient.paymentsDELETE(groupId, paymentId);
  },
};
