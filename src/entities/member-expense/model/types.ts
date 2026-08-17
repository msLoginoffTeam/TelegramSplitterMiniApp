export type MemberExpenseInvolvement = 'all' | 'payer' | 'participant';

export type MemberExpense = {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  payerId: string;
  payerName: string;
  payerUsername?: string;
  createdAt: Date;
  isDraft: boolean;
  isPayer: boolean;
  shareAmount?: number;
  paidAmount?: number;
  overpaymentAmount?: number;
  isPaid?: boolean;
  isPaidByPayments?: boolean;
  isManuallySettled?: boolean;
};
