import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { colors } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

const useStyles = makeStyles((palette) => ({ card: { backgroundColor: palette.surface } }));

describe('makeStyles', () => {
  afterEach(() => jest.restoreAllMocks());

  it('applique la palette du mode clair puis du mode sombre', async () => {
    const scheme = jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');
    const light = await renderHook(() => useStyles());
    expect(light.result.current.card.backgroundColor).toBe(colors.light.surface);

    scheme.mockReturnValue('dark');
    const dark = await renderHook(() => useStyles());
    expect(dark.result.current.card.backgroundColor).toBe(colors.dark.surface);
  });

  it('réutilise la même feuille pour un même mode', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
    const first = await renderHook(() => useStyles());
    const second = await renderHook(() => useStyles());
    expect(second.result.current).toBe(first.result.current);
  });
});
