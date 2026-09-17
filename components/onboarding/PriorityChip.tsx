import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { Text } from '@components/ui/Text';
import { effects, iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { tiltStyle, type CardTilt } from './FloatingCard';

export interface PriorityChipProps {
  label: string;
  icon: IconName;
  /** Pastille remplie d'encre, pour illustrer un critère mis en avant. */
  highlighted: boolean;
  tilt: CardTilt;
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
  highlighted: { backgroundColor: palette.ink },
}));

/** Critère en pastille inclinée (illustration, non tappable). */
export function PriorityChip({ label, icon, highlighted, tilt }: PriorityChipProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={[styles.chip, tiltStyle(tilt), highlighted && styles.highlighted]}>
      <Feather name={highlighted ? 'check' : icon} size={iconSize.md} color={highlighted ? palette.onInk : palette.primary} />
      <Text variant="label" tone={highlighted ? 'onInk' : 'default'}>
        {label}
      </Text>
    </View>
  );
}

export default PriorityChip;
