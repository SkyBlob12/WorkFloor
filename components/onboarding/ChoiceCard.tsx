import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { PressableScale } from '@components/ui/PressableScale';
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
  selected: boolean;
  tilt: CardTilt;
  onPress: () => void;
}

const useStyles = makeStyles((palette) => ({
  card: {
    width: '100%',
    maxWidth: size.stageCard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    padding: spacing.sm,
    boxShadow: effects.cardShadow,
  },
  selected: { borderColor: palette.ink },
  icon: {
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: palette.primaryMuted,
  },
  iconSelected: { backgroundColor: palette.primaryFill },
  body: { flex: 1, gap: spacing.xxs },
}));

/** Choix unique posé sur la scène : incliné au repos, redressé une fois choisi. */
export function ChoiceCard({ title, description, icon, selected, tilt, onPress }: ChoiceCardProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ checked: selected }}
      style={[styles.card, selected ? styles.selected : tiltStyle(tilt)]}>
      <View style={[styles.icon, selected && styles.iconSelected]}>
        <Feather name={icon} size={iconSize.lg} color={selected ? palette.onPrimary : palette.primary} />
      </View>
      <View style={styles.body}>
        <Text variant="label">{title}</Text>
        <Text variant="caption">{description}</Text>
      </View>
      <Feather name={selected ? 'check-circle' : 'circle'} size={iconSize.lg} color={selected ? palette.ink : palette.border} />
    </PressableScale>
  );
}

export default ChoiceCard;
