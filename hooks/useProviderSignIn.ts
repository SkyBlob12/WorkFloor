import { useCallback } from 'react';

import { useMutation } from '@tanstack/react-query';

import type { AuthProvider } from '@constants/auth';
import { signInWithProvider } from '@services/oauth';

export interface ProviderSignInState {
  continueWith: (provider: AuthProvider) => void;
  /** Fournisseur en cours de connexion, sinon `null`. */
  pending: AuthProvider | null;
  error: Error | null;
  reset: () => void;
}

/** Connexion Apple / Google. La session arrive ensuite par le store d'authentification. */
export function useProviderSignIn(): ProviderSignInState {
  const mutation = useMutation<boolean, Error, AuthProvider>({
    meta: { inlineError: true },
    mutationFn: (provider) => signInWithProvider(provider),
  });
  const { mutate, reset } = mutation;

  const continueWith = useCallback((provider: AuthProvider) => mutate(provider), [mutate]);

  return {
    continueWith,
    pending: mutation.isPending ? (mutation.variables ?? null) : null,
    error: mutation.error,
    reset,
  };
}
