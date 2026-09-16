import { StyleSheet } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { iconSize, radius, size, spacing, type ColorName } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { PressableScale } from './PressableScale';

export interface IconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  color?: ColorName;
}

const styles = StyleSheet.create({
  button: {
    width: size.controlSmall,
    height: size.controlSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
});

export function IconButton({ icon, accessibilityLabel, onPress, color = 'text' }: IconButtonProps) {
  const palette = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={styles.button}>
      <Feather name={icon} size={iconSize.md} color={palette[color]} />
    </PressableScale>
  );
}

export default IconButton;
