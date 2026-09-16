export type LaunchSplashDecision = 'pending' | 'show' | 'skip';

export interface LaunchSplashInput {
  isWeb: boolean;
  /** Stockage local de l'onboarding lu, session Supabase restaurée. */
  ready: boolean;
  onboardingCompleted: boolean;
  signedIn: boolean;
}

/**
 * Splash de marque au lancement. Jamais sur le web ni au premier lancement : l'utilisateur
 * doit arriver directement sur la première étape de l'onboarding.
 */
export function decideLaunchSplash({ isWeb, ready, onboardingCompleted, signedIn }: LaunchSplashInput): LaunchSplashDecision {
  if (isWeb) return 'skip';
  if (!ready) return 'pending';
  return onboardingCompleted || signedIn ? 'show' : 'skip';
}

export interface LaunchCoverInput {
  isWeb: boolean;
  decision: LaunchSplashDecision;
  /** Durée du splash de marque écoulée. */
  elapsed: boolean;
  /** Premier lancement mobile : l'onboarding doit s'ouvrir avant de montrer quoi que ce soit. */
  needsOnboarding: boolean;
  onOnboarding: boolean;
}

/**
 * Écran opaque posé par l'app dès son premier rendu, indépendamment du splash natif
 * (qu'Expo Go peut retirer trop tôt) : aucune page ne doit apparaître avant le bon écran.
 */
export function isLaunchCoverVisible({ isWeb, decision, elapsed, needsOnboarding, onOnboarding }: LaunchCoverInput): boolean {
  if (isWeb) return false;
  if (decision === 'pending') return true;
  if (decision === 'show') return !elapsed;
  return needsOnboarding && !onOnboarding;
}
