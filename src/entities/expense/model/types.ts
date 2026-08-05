export type ExpenseWriteInput = {
  title: string;
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
  isPaid: boolean;
};

export type Expense = {
  id: string;
  title: string;
  totalAmount: number;
  payerId: string;
  payerName: string;
  payerUsername?: string;
  createdByUserId: string;
  createdAt: Date;
  isDraft: boolean;
  shares: ExpenseShare[];
};
