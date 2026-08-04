export type ExpenseWriteInput = {
  title: string;
  totalAmount: number;
  payerId: string;
  shares: Array<{
    userId: string;
    amount: number;
  }>;
};
