export type ExpenseWriteInput = {
  title: string;
  description?: string;
  totalAmount: number;
  payerId: string;
  shares: Array<{
    userId: string;
    amount: number;
  }>;
};

export type ExpenseShare = {
  userId: string;
  displayName: string;
  username?: string;
  amount: number;
  paidAmount: number;
  overpaymentAmount: number;
  isPaid: boolean;
  isPaidByPayments: boolean;
  isManuallySettled: boolean;
};

export type Expense = {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  payerId: string;
  payerName: string;
  payerUsername?: string;
  createdByUserId: string;
  createdAt: Date;
  isDraft: boolean;
  shares: ExpenseShare[];
};
