import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { layout, spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';

export interface HorizontalRailProps {
  children: ReactNode;
  accessibilityLabel: string;
}

const styles = StyleSheet.create({
  frame: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' },
  content: { gap: spacing.sm },
  narrow: { paddingHorizontal: spacing.md },
  wide: { paddingHorizontal: spacing.xl },
});

/** Carrousel horizontal aligné sur la colonne de contenu, qui déborde jusqu'au bord de l'écran. */
export function HorizontalRail({ children, accessibilityLabel }: HorizontalRailProps) {
  const { isWide } = useLayout();
  return (
    <View style={styles.frame}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={accessibilityLabel}
        contentContainerStyle={[styles.content, isWide ? styles.wide : styles.narrow]}>
        {children}
      </ScrollView>
    </View>
  );
}

export default HorizontalRail;
