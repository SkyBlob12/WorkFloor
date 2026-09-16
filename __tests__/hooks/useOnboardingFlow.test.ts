import { act, renderHook } from '@testing-library/react-native';

import { useOnboardingFlow } from '@hooks/useOnboardingFlow';
import { useOnboardingStore } from '@stores/onboardingStore';

describe('useOnboardingFlow', () => {
  beforeEach(() => useOnboardingStore.setState({ completed: false, profile: null, priorities: [] }));

  it('bloque le passage à l’étape suivante tant que l’utilisateur n’a pas répondu', async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => result.current.next());
    expect(result.current.step).toBe('profile');

    await act(async () => result.current.setProfile('jobSeeker'));
    await act(async () => result.current.next());
    expect(result.current.step).toBe('priorities');
  });

  it('parcourt toutes les étapes puis enregistre les réponses', async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => result.current.setProfile('employee'));
    await act(async () => result.current.next());
    await act(async () => result.current.togglePriority('salary'));
    await act(async () => result.current.next());
    await act(async () => result.current.setDemoRating(4));
    await act(async () => result.current.next());
    await act(async () => result.current.anonymize());
    await act(async () => result.current.next());

    expect(result.current.step).toBe('auth');
    await act(async () => result.current.back());
    expect(result.current.step).toBe('anonymity');

    await act(async () => result.current.finish());
    expect(useOnboardingStore.getState()).toMatchObject({ completed: true, profile: 'employee', priorities: ['salary'] });
  });

  it('passe directement à la connexion sans répondre aux étapes', async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => result.current.skip());
    expect(result.current.step).toBe('auth');
  });
});
