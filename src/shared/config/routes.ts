type SuggestedTransferPayment = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

type ExpensePaymentInitialValues = {
  fromUserId?: string;
  amount?: number;
};

export const routes = {
  groups: '/groups',
  createGroup: '/groups/new',
  group: (groupId: string) => `/groups/${groupId}`,
  createExpense: (groupId: string) => `/groups/${groupId}/expenses/new`,
  expense: (groupId: string, expenseId: string) => `/groups/${groupId}/expenses/${expenseId}`,
  editExpense: (groupId: string, expenseId: string) =>
    `/groups/${groupId}/expenses/${expenseId}/edit`,
  payments: (groupId: string) => `/groups/${groupId}/payments`,
  createPayment: (groupId: string) => `/groups/${groupId}/payments/new`,
  createSuggestedTransferPayment: (groupId: string, transfer: SuggestedTransferPayment) => {
    const searchParams = new URLSearchParams({
      fromUserId: transfer.fromUserId,
      toUserId: transfer.toUserId,
      amount: transfer.amount.toString(),
    });

    return `/groups/${groupId}/payments/new?${searchParams.toString()}`;
  },
  payment: (groupId: string, paymentId: string) => `/groups/${groupId}/payments/${paymentId}`,
  createExpensePayment: (
    groupId: string,
    expenseId: string,
    initialValues: ExpensePaymentInitialValues = {},
  ) => {
    const searchParams = new URLSearchParams({ expenseId });
    if (initialValues.fromUserId) searchParams.set('fromUserId', initialValues.fromUserId);
    if (initialValues.amount) searchParams.set('amount', initialValues.amount.toString());

    return `/groups/${groupId}/payments/new?${searchParams.toString()}`;
  },
  transfers: (groupId: string) => `/groups/${groupId}/transfers`,
  auditLog: (groupId: string) => `/groups/${groupId}/history`,
  members: (groupId: string) => `/groups/${groupId}/members`,
  settings: (groupId: string) => `/groups/${groupId}/settings`,
  invite: (groupId: string) => `/groups/${groupId}/invite`,
  acceptInvite: '/invite/:token',
} as const;
