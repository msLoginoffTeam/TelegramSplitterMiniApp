export const routes = {
  groups: '/groups',
  createGroup: '/groups/new',
  group: (groupId: string) => `/groups/${groupId}`,
  createExpense: (groupId: string) => `/groups/${groupId}/expenses/new`,
  createPayment: (groupId: string) => `/groups/${groupId}/payments/new`,
  transfers: (groupId: string) => `/groups/${groupId}/transfers`,
  members: (groupId: string) => `/groups/${groupId}/members`,
  settings: (groupId: string) => `/groups/${groupId}/settings`,
  invite: (groupId: string) => `/groups/${groupId}/invite`,
  acceptInvite: '/invite/:token',
} as const;
