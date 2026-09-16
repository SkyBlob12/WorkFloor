import { View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { getIntlTag } from '@/i18n/currentLocale';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { formatRating } from '@utils/format';

import { Text } from './Text';

export interface RatingBadgeProps {
  value: number | null;
}

const useStyles = makeStyles((palette) => ({
  badge: {
    height: size.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: palette.ratingMuted,
    paddingHorizontal: spacing.sm,
  },
}));

/** Note compacte « ★ 4,2 » pour les listes et les cartes d'avis. */
export function RatingBadge({ value }: RatingBadgeProps) {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  const styles = useStyles();
  const formatted = formatRating(value, getIntlTag());
  return (
    <View
      accessible
      accessibilityLabel={value == null ? t('rating.notRated') : t('rating.value', { value: formatted })}
      style={styles.badge}>
      <Ionicons name="star" size={iconSize.xs} color={palette.rating} />
      <Text variant="caption" tone="default" weight="bold">
        {formatted}
      </Text>
    </View>
  );
}

export default RatingBadge;
