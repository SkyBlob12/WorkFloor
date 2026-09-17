import { Appearance } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { THEME_MODE_STORAGE_KEY } from '@constants/appearance';
import { useThemeStore } from '@stores/themeStore';

describe('themeStore', () => {
  const setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => undefined);

  beforeEach(async () => {
    await AsyncStorage.clear();
    setColorScheme.mockClear();
    useThemeStore.setState({ mode: 'system' });
  });

  it('enregistre le mode choisi et l’applique aux éléments natifs', async () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
    expect(setColorScheme).toHaveBeenCalledWith('dark');
    await expect(AsyncStorage.getItem(THEME_MODE_STORAGE_KEY)).resolves.toBe('dark');
  });

  it('rend la main à l’appareil en mode système', () => {
    useThemeStore.getState().setMode('system');
    expect(setColorScheme).toHaveBeenCalledWith('unspecified');
  });

  it('restaure le mode stocké, et ignore une valeur invalide', async () => {
    await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, 'light');
    await useThemeStore.getState().hydrate();
    expect(useThemeStore.getState().mode).toBe('light');

    await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, 'neon');
    await useThemeStore.getState().hydrate();
    expect(useThemeStore.getState().mode).toBe('system');
  });
});
