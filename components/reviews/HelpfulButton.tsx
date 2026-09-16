import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

export interface HelpfulButtonProps {
  voted: boolean;
  count: number;
  onPress: () => void;
}

const useStyles = makeStyles((palette) => ({
  button: {
    height: size.controlSmall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: spacing.md,
  },
  voted: { backgroundColor: palette.primaryMuted },
}));

export function HelpfulButton({ voted, count, onPress }: HelpfulButtonProps) {
  const { t } = useTranslation('reviews');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: voted }}
      accessibilityLabel={t('card.helpfulA11y', { count })}
      style={[styles.button, voted && styles.voted]}>
      <Feather name="thumbs-up" size={iconSize.sm} color={voted ? palette.primary : palette.textMuted} />
      <Text variant="caption" tone={voted ? 'primary' : 'default'} weight="semibold">
        {count > 0 ? t('card.helpfulCount', { count }) : t('card.helpful')}
      </Text>
    </PressableScale>
  );
}

export default HelpfulButton;
