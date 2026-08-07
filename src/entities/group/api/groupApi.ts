import {
  AcceptGroupInviteRequestDto,
  CreateGroupRequestDto,
  GroupPermission as ApiGroupPermission,
  GroupRole as ApiGroupRole,
  UpdateGroupMemberPermissionsRequestDto,
} from '@/shared/api/generated/client';
import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type {
  ExpenseSummary,
  GroupBalance,
  GroupDashboard,
  GroupMember,
  GroupOverview,
} from '@/entities/group/model/types';

function toGroupOverview(group: { id?: string; title?: string | null }): GroupOverview {
  if (!group.id || !group.title) {
    throw new Error('Backend returned a group without an ID or title.');
  }

  return { id: group.id, title: group.title };
}

function toGroupMember(member: {
  userId?: string;
  displayName?: string | null;
  username?: string | null;
  telegramId?: number;
  isOwner?: boolean;
  role?: number;
  permissions?: number[] | null;
}): GroupMember {
  if (!member.userId) {
    throw new Error('Backend returned a group member without an ID.');
  }

  return {
    userId: member.userId,
    displayName: member.displayName ?? `Участник ${member.telegramId ?? ''}`.trim(),
    username: member.username ?? undefined,
    isOwner: member.isOwner ?? false,
    role: member.role ?? 4,
    permissions: member.permissions ?? [],
  };
}

function toBalance(balance: {
  userId?: string;
  displayName?: string | null;
  username?: string | null;
  balance?: number;
}): GroupBalance {
  if (!balance.userId || balance.balance === undefined) {
    throw new Error('Backend returned an incomplete group balance.');
  }

  return {
    userId: balance.userId,
    displayName: balance.displayName ?? 'Участник',
    username: balance.username ?? undefined,
    amount: balance.balance,
  };
}

function toExpenseSummary(expense: {
  id?: string;
  title?: string | null;
  totalAmount?: number;
  payerName?: string | null;
  payerUsername?: string | null;
  createdAt?: Date;
}): ExpenseSummary {
  if (!expense.id || !expense.title || expense.totalAmount === undefined || !expense.createdAt) {
    throw new Error('Backend returned an incomplete expense.');
  }

  return {
    id: expense.id,
    title: expense.title,
    totalAmount: expense.totalAmount,
    payerName: expense.payerName ?? 'Участник',
    payerUsername: expense.payerUsername ?? undefined,
    createdAt: expense.createdAt,
  };
}

export const groupApi = {
  async getMyGroups(): Promise<GroupOverview[]> {
    const groups = await GeneratedClient.my();
    return groups.map(toGroupOverview);
  },

  async createGroup(title: string): Promise<GroupOverview> {
    const group = await GeneratedClient.groupsPOST(new CreateGroupRequestDto({ title }));
    return toGroupOverview(group);
  },

  async createInvite(groupId: string) {
    return GeneratedClient.invites(groupId);
  },

  async acceptInvite(token: string): Promise<GroupOverview> {
    const group = await GeneratedClient.accept(new AcceptGroupInviteRequestDto({ token }));
    return toGroupOverview(group);
  },

  removeMember(groupId: string, userId: string): Promise<void> {
    return GeneratedClient.usersDELETE(groupId, userId);
  },

  updateMemberPermissions(
    groupId: string,
    userId: string,
    role: number,
    permissions?: number[],
  ): Promise<void> {
    return GeneratedClient.permissions(
      groupId,
      userId,
      new UpdateGroupMemberPermissionsRequestDto({
        role: role as ApiGroupRole,
        permissions: permissions?.map((permission) => permission as ApiGroupPermission),
      }),
    );
  },

  async getDashboard(groupId: string): Promise<GroupDashboard> {
    const [group, balance, expenses, currentUser] = await Promise.all([
      GeneratedClient.groupsGET(groupId),
      GeneratedClient.balance(groupId),
      GeneratedClient.expensesAll(groupId),
      GeneratedClient.me(),
    ]);

    if (!group.id || !group.title || !currentUser.id) {
      throw new Error('Backend returned an incomplete group dashboard.');
    }

    return {
      id: group.id,
      title: group.title,
      members: (group.members ?? []).map(toGroupMember),
      balances: (balance.balances ?? []).map(toBalance),
      expenses: expenses.map(toExpenseSummary),
      currentUserId: currentUser.id,
    };
  },
};
