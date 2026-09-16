import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { effects, iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SelectableCardProps {
  title: string;
  description?: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  /** `radio` : choix unique ; `checkbox` : choix multiple. */
  role: 'radio' | 'checkbox';
  disabled?: boolean;
}

const useStyles = makeStyles((palette) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: palette.surface,
    padding: spacing.md,
  },
  selected: { borderColor: palette.primary },
  disabled: { opacity: effects.dimmedOpacity },
  icon: {
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: palette.surfaceMuted,
  },
  iconSelected: { backgroundColor: palette.primaryMuted },
  body: { flex: 1, gap: spacing.xxs },
}));

/** Grande carte sélectionnable : réponses d'onboarding, choix importants. */
export function SelectableCard({ title, description, icon, selected, onPress, role, disabled = false }: SelectableCardProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  const indicator = role === 'radio' ? (selected ? 'check-circle' : 'circle') : selected ? 'check-square' : 'square';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ checked: selected, disabled }}
      style={[styles.card, selected && styles.selected, disabled && styles.disabled]}>
      <View style={[styles.icon, selected && styles.iconSelected]}>
        <Feather name={icon} size={iconSize.lg} color={selected ? palette.primary : palette.text} />
      </View>
      <View style={styles.body}>
        <Text variant="label">{title}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
      <Feather name={indicator} size={iconSize.lg} color={selected ? palette.primary : palette.border} />
    </PressableScale>
  );
}

export default SelectableCard;
