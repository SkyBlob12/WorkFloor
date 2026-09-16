import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { iconSize, spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';

import { PressableScale } from './PressableScale';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel: string;
  children: ReactNode;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  body: { flex: 1 },
});

export function Checkbox({ checked, onChange, accessibilityLabel, children }: CheckboxProps) {
  const palette = useThemeColors();
  return (
    <PressableScale
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      style={styles.row}>
      <Feather name={checked ? 'check-square' : 'square'} size={iconSize.lg} color={checked ? palette.primary : palette.textMuted} />
      <View style={styles.body}>{children}</View>
    </PressableScale>
  );
}

export default Checkbox;
