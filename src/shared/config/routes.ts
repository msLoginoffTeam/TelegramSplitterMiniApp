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
  payment: (groupId: string, paymentId: string) => `/groups/${groupId}/payments/${paymentId}`,
  createExpensePayment: (groupId: string, expenseId: string) =>
    `/groups/${groupId}/payments/new?expenseId=${encodeURIComponent(expenseId)}`,
  transfers: (groupId: string) => `/groups/${groupId}/transfers`,
  members: (groupId: string) => `/groups/${groupId}/members`,
  settings: (groupId: string) => `/groups/${groupId}/settings`,
  invite: (groupId: string) => `/groups/${groupId}/invite`,
  acceptInvite: '/invite/:token',
} as const;
