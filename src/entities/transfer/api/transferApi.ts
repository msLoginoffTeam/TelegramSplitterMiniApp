import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type { TransferSuggestion } from '@/entities/transfer/model/types';

function toTransferSuggestion(transfer: {
  fromUserId?: string;
  fromDisplayName?: string | null;
  fromUsername?: string | null;
  toUserId?: string;
  toDisplayName?: string | null;
  toUsername?: string | null;
  amount?: number;
}): TransferSuggestion {
  if (!transfer.fromUserId || !transfer.toUserId || transfer.amount === undefined) {
    throw new Error('Backend returned an incomplete transfer suggestion.');
  }

  return {
    fromUserId: transfer.fromUserId,
    fromDisplayName: transfer.fromDisplayName ?? 'Участник',
    fromUsername: transfer.fromUsername ?? undefined,
    toUserId: transfer.toUserId,
    toDisplayName: transfer.toDisplayName ?? 'Участник',
    toUsername: transfer.toUsername ?? undefined,
    amount: transfer.amount,
  };
}

export const transferApi = {
  async getSuggestions(groupId: string): Promise<TransferSuggestion[]> {
    const response = await GeneratedClient.transfers(groupId);
    return (response.transfers ?? []).map(toTransferSuggestion);
  },
};
