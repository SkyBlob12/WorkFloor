import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { Text } from './Text';

export type PillTone = 'neutral' | 'primary' | 'warning';

export interface PillProps {
  label: string;
  icon?: IconName;
  tone?: PillTone;
}

const useStyles = makeStyles((palette) => ({
  pill: {
    height: size.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  neutral: { backgroundColor: palette.surfaceMuted },
  primary: { backgroundColor: palette.primaryMuted },
  warning: { backgroundColor: palette.ratingMuted },
}));

const textTone = { neutral: 'default', primary: 'primary', warning: 'warning' } as const;

export function Pill({ label, icon, tone = 'neutral' }: PillProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  const iconColor = { neutral: palette.textMuted, primary: palette.primary, warning: palette.warning }[tone];
  return (
    <View style={[styles.pill, styles[tone]]}>
      {icon ? <Feather name={icon} size={iconSize.xs} color={iconColor} /> : null}
      <Text variant="caption" tone={textTone[tone]} weight="medium">
        {label}
      </Text>
    </View>
  );
}

export default Pill;
