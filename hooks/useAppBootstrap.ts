import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { restorePreferredLocale } from '@/i18n';
import { trackScreen } from '@lib/analytics';
import { queryClient } from '@lib/queryClient';
import { queryKeys } from '@lib/queryKeys';
import { subscribeToAuth } from '@stores/authStore';
import { useConsentStore } from '@stores/consentStore';
import { useOnboardingStore } from '@stores/onboardingStore';

/** Effets globaux de démarrage : session, langue, consentement, suivi d'écran (le splash est géré par `useLaunchSplash`). */
export function useAppBootstrap(): void {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(
    () =>
      subscribeToAuth((session) => {
        const userId = session?.user.id ?? null;
        // Changement de compte : les données "moi" et les drapeaux is_mine / voted_helpful sont périmés.
        if (previousUserId.current !== undefined && previousUserId.current !== userId) {
          queryClient.removeQueries({ queryKey: queryKeys.me() });
          void queryClient.invalidateQueries();
        }
        previousUserId.current = userId;
      }),
    [],
  );

  useEffect(() => {
    void useConsentStore.getState().hydrate();
    void useOnboardingStore.getState().hydrate();
    void restorePreferredLocale();
  }, []);

  useEffect(() => {
    trackScreen(pathname);
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && i18n.resolvedLanguage) {
      document.documentElement.lang = i18n.resolvedLanguage;
    }
  }, [i18n.resolvedLanguage]);
}
