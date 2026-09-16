import { useWindowDimensions } from 'react-native';

import { breakpoints } from '@constants/theme';

export interface LayoutInfo {
  width: number;
  /** Au-delà : top bar au lieu de la tab bar, colonnes côte à côte. */
  isWide: boolean;
  isDesktop: boolean;
}

export function useLayout(): LayoutInfo {
  const { width } = useWindowDimensions();
  return { width, isWide: width >= breakpoints.wide, isDesktop: width >= breakpoints.desktop };
}
