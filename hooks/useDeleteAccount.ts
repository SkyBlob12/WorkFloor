import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { deleteAccount } from '@services/account';

export function useDeleteAccount(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => queryClient.clear(),
  });
}
