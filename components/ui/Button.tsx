import { ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { effects, iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const useStyles = makeStyles((palette) => ({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  md: { height: size.control, borderRadius: radius.full, paddingHorizontal: spacing.lg },
  sm: { height: size.controlSmall, borderRadius: radius.full, paddingHorizontal: spacing.md },
  primary: { backgroundColor: palette.ink },
  secondary: { backgroundColor: palette.surfaceMuted },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: palette.dangerMuted },
  inactive: { opacity: effects.disabledOpacity },
}));

const textTone = { primary: 'onInk', secondary: 'default', ghost: 'primary', danger: 'danger' } as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  size: buttonSize = 'md',
  style,
  accessibilityHint,
}: ButtonProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  const iconColor = { primary: palette.onInk, secondary: palette.text, ghost: palette.primary, danger: palette.danger }[
    variant
  ];
  const inactive = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.base, styles[buttonSize], styles[variant], inactive && styles.inactive, style]}>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : icon ? (
        <Feather name={icon} size={buttonSize === 'sm' ? iconSize.sm : iconSize.md} color={iconColor} />
      ) : null}
      <Text variant={buttonSize === 'sm' ? 'caption' : 'label'} tone={textTone[variant]} weight="semibold">
        {label}
      </Text>
    </PressableScale>
  );
}

export default Button;
