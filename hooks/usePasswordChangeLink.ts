import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { sendPasswordReset } from '@services/account';

import { useAuthUser } from './useAuthUser';

/**
 * Changement de mot de passe depuis les paramètres : envoie le lien de réinitialisation à l'adresse du compte.
 * Le lien ouvre l'écran `reset-password`, qui vérifie la session de récupération.
 */
export function usePasswordChangeLink(): UseMutationResult<void, Error, void> {
  const user = useAuthUser();
  return useMutation({ mutationFn: () => sendPasswordReset(user?.email ?? '') });
}
