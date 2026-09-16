import type { ViewStyle } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@constants/theme';

import { useLayout } from './useLayout';
import { useTabBarInset } from './useTabBarInset';

/** Marges du contenu défilant. `inTabs` : zone sûre du haut et place pour la barre flottante. */
export function useScreenContentStyle(inTabs = false): ViewStyle {
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  return {
    paddingTop: inTabs && !isWide ? insets.top : 0,
    paddingBottom: (inTabs ? tabBarInset : insets.bottom) + spacing.xl,
  };
}
