import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import { createCompanyFromSiren } from '@services/companies';

export function useCreateCompany(): UseMutationResult<{ id: string; created: boolean }, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCompanyFromSiren,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}
