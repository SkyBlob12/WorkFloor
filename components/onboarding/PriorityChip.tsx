import Feather from '@expo/vector-icons/Feather';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { effects, iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { tiltStyle, type CardTilt } from './FloatingCard';

export interface PriorityChipProps {
  label: string;
  icon: IconName;
  selected: boolean;
  disabled: boolean;
  tilt: CardTilt;
  onPress: () => void;
}

const useStyles = makeStyles((palette) => ({
  chip: {
    height: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    borderWidth: size.outline,
    borderColor: palette.outline,
    boxShadow: effects.cardShadow,
  },
  selected: { backgroundColor: palette.ink },
  disabled: { opacity: effects.dimmedOpacity },
}));

/** Critère en pastille inclinée : se remplit d'encre une fois choisi. */
export function PriorityChip({ label, icon, selected, disabled, tilt, onPress }: PriorityChipProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      style={[styles.chip, tiltStyle(tilt), selected && styles.selected, disabled && styles.disabled]}>
      <Feather name={selected ? 'check' : icon} size={iconSize.md} color={selected ? palette.onInk : palette.primary} />
      <Text variant="label" tone={selected ? 'onInk' : 'default'}>
        {label}
      </Text>
    </PressableScale>
  );
}

export default PriorityChip;
