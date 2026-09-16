import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { layout, spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';

export interface ContentColumnProps {
  children: ReactNode;
  /** `reading` pour les formulaires et textes longs. */
  width?: 'content' | 'reading';
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  column: { width: '100%', alignSelf: 'center' },
  content: { maxWidth: layout.contentMaxWidth },
  reading: { maxWidth: layout.readingMaxWidth },
  narrow: { paddingHorizontal: spacing.md },
  wide: { paddingHorizontal: spacing.xl },
});

/** Colonne centrée à largeur maximale, avec les marges latérales de l'écran. */
export function ContentColumn({ children, width = 'content', style }: ContentColumnProps) {
  const { isWide } = useLayout();
  return <View style={[styles.column, styles[width], isWide ? styles.wide : styles.narrow, style]}>{children}</View>;
}

export default ContentColumn;
