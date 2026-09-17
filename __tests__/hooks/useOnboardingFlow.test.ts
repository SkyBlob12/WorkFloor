import { act, renderHook } from '@testing-library/react-native';

import { useOnboardingFlow } from '@hooks/useOnboardingFlow';
import { useOnboardingStore } from '@stores/onboardingStore';

describe('useOnboardingFlow', () => {
  beforeEach(() => useOnboardingStore.setState({ completed: false, profile: null, priorities: [] }));

  it('passe à l’étape suivante sans interaction', async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => result.current.next());
    expect(result.current.step).toBe('priorities');
  });

  it('parcourt toutes les étapes, revient en arrière puis termine', async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    for (let index = 1; index < result.current.stepCount; index += 1) {
      await act(async () => result.current.next());
    }
    expect(result.current.step).toBe('auth');
    await act(async () => result.current.next());
    expect(result.current.step).toBe('auth');

    await act(async () => result.current.back());
    expect(result.current.step).toBe('anonymity');

    await act(async () => result.current.finish());
    expect(useOnboardingStore.getState().completed).toBe(true);
  });

  it('conserve les priorités déjà enregistrées en terminant', async () => {
    useOnboardingStore.setState({ priorities: ['salary'] });
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => result.current.finish());
    expect(useOnboardingStore.getState()).toMatchObject({ completed: true, priorities: ['salary'] });
  });

  it('passe directement à la connexion', async () => {
    const { result } = await renderHook(() => useOnboardingFlow());
    await act(async () => result.current.skip());
    expect(result.current.step).toBe('auth');
  });
});
