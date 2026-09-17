import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { Text } from '@components/ui/Text';
import { effects, iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { tiltStyle, type CardTilt } from './FloatingCard';

export interface ChoiceCardProps {
  title: string;
  description: string;
  icon: IconName;
  tilt: CardTilt;
}

const useStyles = makeStyles((palette) => ({
  card: {
    width: '100%',
    maxWidth: size.stageCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: size.outline,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    padding: spacing.sm,
    boxShadow: effects.cardShadow,
  },
  icon: {
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: palette.primaryMuted,
  },
  body: { flex: 1, gap: spacing.xxs },
}));

/** Carte de situation posée sur la scène, inclinée (illustration, non tappable). */
export function ChoiceCard({ title, description, icon, tilt }: ChoiceCardProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={[styles.card, tiltStyle(tilt)]}>
      <View style={styles.icon}>
        <Feather name={icon} size={iconSize.lg} color={palette.primary} />
      </View>
      <View style={styles.body}>
        <Text variant="label">{title}</Text>
        <Text variant="caption">{description}</Text>
      </View>
    </View>
  );
}

export default ChoiceCard;
