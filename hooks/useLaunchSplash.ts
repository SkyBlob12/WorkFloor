import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { ONBOARDING_PATH } from '@constants/onboarding';
import { motion } from '@constants/theme';
import { useOnboardingStore } from '@stores/onboardingStore';
import { decideLaunchSplash, isLaunchCoverVisible, type LaunchSplashDecision } from '@utils/launchSplash';

import { useAuthInitializing, useAuthUser } from './useAuthUser';

export interface LaunchSplashState {
  /** Écran opaque au-dessus de l'app (dès le premier rendu, jusqu'au bon écran). */
  covering: boolean;
  /** Logo et nom affichés sur cet écran : lancements suivants uniquement. */
  showBrand: boolean;
  /** À brancher sur `onLayout` de l'écran : le splash natif peut partir, le relais est pris. */
  onDrawn: () => void;
}

export function useLaunchSplash(): LaunchSplashState {
  const hydrated = useOnboardingStore((state) => state.hydrated);
  const completed = useOnboardingStore((state) => state.completed);
  const initializing = useAuthInitializing();
  const signedIn = useAuthUser() !== null;
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';
  // Décision figée une fois prise : terminer l'onboarding ou se connecter ensuite ne relance pas le splash.
  const [decision, setDecision] = useState<LaunchSplashDecision>('pending');
  const [elapsed, setElapsed] = useState(false);

  const live = decideLaunchSplash({ isWeb, ready: hydrated && !initializing, onboardingCompleted: completed, signedIn });
  const current = decision === 'pending' ? live : decision;
  const covering = isLaunchCoverVisible({
    isWeb,
    decision: current,
    elapsed,
    needsOnboarding: !completed && !signedIn,
    onOnboarding: pathname === ONBOARDING_PATH,
  });

  useEffect(() => {
    if (decision === 'pending' && live !== 'pending') setDecision(live);
  }, [decision, live]);

  useEffect(() => {
    if (isWeb) void SplashScreen.hideAsync();
  }, [isWeb]);

  useEffect(() => {
    if (current !== 'show') return undefined;
    const timer = setTimeout(() => setElapsed(true), motion.splashDuration);
    return () => clearTimeout(timer);
  }, [current]);

  const onDrawn = useCallback(() => void SplashScreen.hideAsync(), []);

  return { covering, showBrand: current === 'show', onDrawn };
}
