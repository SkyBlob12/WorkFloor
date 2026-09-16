import { useCallback } from 'react';

import { useRouter } from 'expo-router';

import { useAuthUser } from './useAuthUser';

/** Renvoie une garde : `true` si connecté, sinon ouvre l'écran de connexion et renvoie `false`. */
export function useRequireAuth(): () => boolean {
  const user = useAuthUser();
  const router = useRouter();
  return useCallback(() => {
    if (user) return true;
    router.push('/sign-in');
    return false;
  }, [user, router]);
}
