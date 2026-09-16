import { decideLaunchSplash, isLaunchCoverVisible } from '@utils/launchSplash';

const base = { isWeb: false, ready: true, onboardingCompleted: true, signedIn: false };

describe('decideLaunchSplash', () => {
  it('attend la lecture du stockage et de la session', () => {
    expect(decideLaunchSplash({ ...base, ready: false })).toBe('pending');
  });

  it('ne s’affiche jamais au premier lancement', () => {
    expect(decideLaunchSplash({ ...base, onboardingCompleted: false })).toBe('skip');
  });

  it('s’affiche aux lancements suivants ou pour un utilisateur déjà connecté', () => {
    expect(decideLaunchSplash(base)).toBe('show');
    expect(decideLaunchSplash({ ...base, onboardingCompleted: false, signedIn: true })).toBe('show');
  });

  it('ne s’affiche jamais sur le web', () => {
    expect(decideLaunchSplash({ ...base, isWeb: true, ready: false })).toBe('skip');
  });
});

describe('isLaunchCoverVisible', () => {
  const input = { isWeb: false, decision: 'pending' as const, elapsed: false, needsOnboarding: false, onOnboarding: false };

  it('couvre l’app tant que l’état est inconnu', () => {
    expect(isLaunchCoverVisible(input)).toBe(true);
  });

  it('couvre pendant le splash de marque puis se retire', () => {
    expect(isLaunchCoverVisible({ ...input, decision: 'show' })).toBe(true);
    expect(isLaunchCoverVisible({ ...input, decision: 'show', elapsed: true })).toBe(false);
  });

  it('au premier lancement, couvre jusqu’à l’ouverture de l’onboarding', () => {
    const first = { ...input, decision: 'skip' as const, needsOnboarding: true };
    expect(isLaunchCoverVisible(first)).toBe(true);
    expect(isLaunchCoverVisible({ ...first, onOnboarding: true })).toBe(false);
  });

  it('ne couvre jamais le web', () => {
    expect(isLaunchCoverVisible({ ...input, isWeb: true })).toBe(false);
  });
});
