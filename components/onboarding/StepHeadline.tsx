import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';

export interface StepHeadlineProps {
  /** Titre, généralement un `<Trans>` dont la balise `<accent>` colore un mot. */
  title: ReactNode;
  subtitle: string;
}

const styles = StyleSheet.create({
  headline: { gap: spacing.sm, paddingHorizontal: spacing.sm },
});

/** Composant `accent` à passer à `<Trans components={ACCENT} />`. */
export const ACCENT = { accent: <Text variant="hero" tone="primary" /> };

/** Gros titre centré et sous-titre discret, sous l'illustration de l'étape. */
export function StepHeadline({ title, subtitle }: StepHeadlineProps) {
  return (
    <View style={styles.headline}>
      <Text variant="hero" align="center" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="body" tone="muted" align="center">
        {subtitle}
      </Text>
    </View>
  );
}

export default StepHeadline;
