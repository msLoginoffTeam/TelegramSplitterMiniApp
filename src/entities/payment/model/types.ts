export type Payment = {
  id: string;
  expenseId?: string;
  fromUserId: string;
  fromDisplayName: string;
  fromUsername?: string;
  toUserId: string;
  toDisplayName: string;
  toUsername?: string;
  createdByUserId: string;
  amount: number;
  description?: string;
  timestamp: Date;
};

export type CreatePaymentInput =
  | {
      kind: 'direct';
      fromUserId: string;
      toUserId: string;
      amount: number;
      description?: string;
    }
  | {
      kind: 'expense';
      expenseId: string;
      fromUserId: string;
      amount: number;
      description?: string;
    };
