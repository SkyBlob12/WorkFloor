import { act, renderHook } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';

import { motion } from '@constants/theme';
import { useLaunchSplash } from '@hooks/useLaunchSplash';
import { useAuthStore } from '@stores/authStore';
import { useOnboardingStore } from '@stores/onboardingStore';

let mockPathname = '/';

jest.mock('expo-router', () => ({ ...jest.requireActual('expo-router'), usePathname: () => mockPathname }));
jest.mock('expo-splash-screen', () => ({ hideAsync: jest.fn(() => Promise.resolve()) }));

const hideAsync = jest.mocked(SplashScreen.hideAsync);

describe('useLaunchSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockPathname = '/';
    useAuthStore.setState({ session: null, initializing: false });
    useOnboardingStore.setState({ hydrated: true, completed: true, profile: null, priorities: [] });
  });

  afterEach(() => jest.useRealTimers());

  it('couvre l’app pendant la lecture de l’état, sans logo', async () => {
    useOnboardingStore.setState({ hydrated: false });
    const { result } = await renderHook(() => useLaunchSplash());
    expect(result.current).toMatchObject({ covering: true, showBrand: false });
  });

  it('affiche le logo aux lancements suivants puis se retire', async () => {
    const { result } = await renderHook(() => useLaunchSplash());
    expect(result.current).toMatchObject({ covering: true, showBrand: true });

    await act(async () => result.current.onDrawn());
    expect(hideAsync).toHaveBeenCalled();

    await act(async () => jest.advanceTimersByTime(motion.splashDuration));
    expect(result.current.covering).toBe(false);
  });

  it('au premier lancement : jamais de logo, écran couvert jusqu’à l’onboarding', async () => {
    useOnboardingStore.setState({ completed: false });
    const { result, rerender } = await renderHook(() => useLaunchSplash());
    expect(result.current).toMatchObject({ covering: true, showBrand: false });

    mockPathname = '/onboarding';
    await rerender({});
    expect(result.current.covering).toBe(false);

    await act(async () => useOnboardingStore.setState({ completed: true }));
    expect(result.current).toMatchObject({ covering: false, showBrand: false });
  });
});
