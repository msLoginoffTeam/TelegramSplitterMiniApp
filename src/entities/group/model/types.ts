export type GroupOverview = {
  id: string;
  title: string;
};

export type GroupMember = {
  userId: string;
  displayName: string;
  username?: string;
  isOwner: boolean;
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
  totalAmount: number;
  payerName: string;
  payerUsername?: string;
  createdAt: Date;
};

export type GroupDashboard = {
  id: string;
  title: string;
  members: GroupMember[];
  balances: GroupBalance[];
  expenses: ExpenseSummary[];
  currentUserId: string;
};
