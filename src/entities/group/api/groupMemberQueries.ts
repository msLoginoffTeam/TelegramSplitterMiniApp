import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from './groupApi';
import { groupQueryKeys } from './groupQueries';

export function useRemoveGroupMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => groupApi.removeMember(groupId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) }),
  });
}

export function useUpdateGroupMemberPermissions(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
      permissions,
    }: {
      userId: string;
      role: number;
      permissions?: number[];
    }) => groupApi.updateMemberPermissions(groupId, userId, role, permissions),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(groupId) }),
  });
}
