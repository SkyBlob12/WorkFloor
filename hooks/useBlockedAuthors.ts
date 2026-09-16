import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { queryKeys } from '@lib/queryKeys';
import { countBlockedAuthors, unblockAllAuthors } from '@services/moderation';

import { useAuthUser } from './useAuthUser';

export function useBlockedAuthorsCount(): UseQueryResult<number> {
  const user = useAuthUser();
  return useQuery({ queryKey: queryKeys.blockedAuthors(), queryFn: countBlockedAuthors, enabled: Boolean(user) });
}

export function useUnblockAllAuthors(): UseMutationResult<void, Error, void> {
  const user = useAuthUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unblockAllAuthors(user?.id ?? ''),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.blockedAuthors() }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
      ]),
  });
}
