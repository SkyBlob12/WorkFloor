import { useEffect } from 'react';
import { Platform } from 'react-native';

import { usePathname, useRouter } from 'expo-router';

import { ONBOARDING_PATH } from '@constants/onboarding';
import { useOnboardingStore } from '@stores/onboardingStore';

import { useAuthInitializing, useAuthUser } from './useAuthUser';

/**
 * Premier lancement de l'app mobile : redirige vers l'onboarding. Le web n'en a pas
 * (un visiteur arrive souvent directement sur une fiche depuis un moteur de recherche).
 * Un utilisateur déjà connecté (installation existante) le saute.
 */
export function useOnboardingGate(): void {
  const hydrated = useOnboardingStore((state) => state.hydrated);
  const completed = useOnboardingStore((state) => state.completed);
  const initializing = useAuthInitializing();
  const user = useAuthUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web' || !hydrated || completed || initializing) return;
    if (pathname === ONBOARDING_PATH) return;
    if (user) {
      useOnboardingStore.getState().complete({ profile: null, priorities: [] });
      return;
    }
    router.replace(ONBOARDING_PATH);
  }, [hydrated, completed, initializing, user, pathname, router]);
}
