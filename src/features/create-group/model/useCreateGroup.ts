import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi, groupQueryKeys } from '@/entities/group';

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => groupApi.createGroup(title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupQueryKeys.all });
    },
  });
}
