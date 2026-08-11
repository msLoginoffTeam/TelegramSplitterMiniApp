export type GroupOverview = {
  id: string;
  title: string;
};

export type GroupMember = {
  userId: string;
  displayName: string;
  username?: string;
  isOwner: boolean;
  role: number;
  permissions: number[];
};

export type GroupBalance = {
  userId: string;
  displayName: string;
  username?: string;
  amount: number;
};

export type ExpenseSummary = {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  payerId: string;
  payerName: string;
  payerUsername?: string;
  createdAt: Date;
  isDraft: boolean;
  isSettled: boolean;
};

export type GroupDashboard = {
  id: string;
  title: string;
  members: GroupMember[];
  balances: GroupBalance[];
  expenses: ExpenseSummary[];
  currentUserId: string;
};
