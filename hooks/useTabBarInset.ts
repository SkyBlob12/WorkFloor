import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { size, spacing } from '@constants/theme';

import { useLayout } from './useLayout';

/** Hauteur occupée par la barre d'onglets flottante (0 sur grand écran, où elle est remplacée par la TopBar). */
export function useTabBarInset(): number {
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();
  if (isWide) return 0;
  return tabBarBottomOffset(insets.bottom) + size.tabBar;
}

/** Distance entre le bas de l'écran et la barre : zone sûre, avec un minimum pour les appareils sans encoche. */
export function tabBarBottomOffset(safeBottom: number): number {
  return Math.max(safeBottom, spacing.md);
}
