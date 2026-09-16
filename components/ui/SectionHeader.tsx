import { StyleSheet, View } from 'react-native';

import { spacing } from '@constants/theme';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  caption?: string;
  action?: { label: string; onPress: () => void };
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  text: { flex: 1, gap: spacing.xxs },
  action: { paddingVertical: spacing.xs },
});

/** Titre de section avec légende et action optionnelles (« Effacer », « Voir tout »). */
export function SectionHeader({ title, caption, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {caption ? <Text variant="caption">{caption}</Text> : null}
      </View>
      {action ? (
        <PressableScale accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress} style={styles.action}>
          <Text variant="label" tone="primary">
            {action.label}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

export default SectionHeader;
