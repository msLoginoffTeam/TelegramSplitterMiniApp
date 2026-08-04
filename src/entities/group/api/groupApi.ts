import { CreateGroupRequestDto } from '@/shared/api/generated/client';
import * as GeneratedClient from '@/shared/api/generated/client/Client';
import type { GroupOverview } from '@/entities/group/model/types';

function toGroupOverview(group: { id?: string; title?: string | null }): GroupOverview {
  if (!group.id || !group.title) {
    throw new Error('Backend returned a group without an ID or title.');
  }

  return { id: group.id, title: group.title };
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
};
