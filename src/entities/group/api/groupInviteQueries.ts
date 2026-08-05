import { useMutation } from '@tanstack/react-query';
import { groupApi } from './groupApi';

export function useCreateGroupInvite(groupId: string) {
  return useMutation({
    mutationFn: () => groupApi.createInvite(groupId),
  });
}

export function useAcceptGroupInvite() {
  return useMutation({
    mutationFn: (token: string) => groupApi.acceptInvite(token),
  });
}
