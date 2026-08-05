import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from './groupApi';
import { groupQueryKeys } from './groupQueries';

export function useCreateGroupInvite(groupId: string) {
  return useMutation({
    mutationFn: () => groupApi.createInvite(groupId),
  });
}

export function useAcceptGroupInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => groupApi.acceptInvite(token),
    onSuccess: async (group) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: groupQueryKeys.mine() }),
        queryClient.invalidateQueries({ queryKey: groupQueryKeys.detail(group.id) }),
      ]);
    },
  });
}
