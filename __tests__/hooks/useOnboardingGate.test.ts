import { renderHook } from '@testing-library/react-native';

import { useOnboardingGate } from '@hooks/useOnboardingGate';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingStore } from '@stores/onboardingStore';

const mockReplace = jest.fn();
let mockPathname = '/';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockPathname,
}));

describe('useOnboardingGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/';
    useAuthStore.setState({ session: null, initializing: false });
    useOnboardingStore.setState({ hydrated: true, completed: false, profile: null, priorities: [] });
  });

  it('redirige vers l’onboarding au premier lancement', async () => {
    await renderHook(() => useOnboardingGate());
    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('attend la lecture du stockage et laisse passer une fois terminé', async () => {
    useOnboardingStore.setState({ hydrated: false });
    await renderHook(() => useOnboardingGate());
    useOnboardingStore.setState({ hydrated: true, completed: true });
    await renderHook(() => useOnboardingGate());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('fait sauter l’onboarding à un utilisateur déjà connecté', async () => {
    useAuthStore.setState({ session: { user: { id: 'u1' } } as never });
    await renderHook(() => useOnboardingGate());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(useOnboardingStore.getState().completed).toBe(true);
  });

  it('ne redirige pas quand l’onboarding est déjà affiché', async () => {
    mockPathname = '/onboarding';
    await renderHook(() => useOnboardingGate());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
