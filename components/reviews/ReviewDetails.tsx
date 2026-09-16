import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { getIntlTag } from '@/i18n/currentLocale';
import { Text } from '@components/ui/Text';
import { RATING_CRITERIA } from '@constants/reviews';
import { iconSize, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { formatInteger } from '@utils/format';
import type { PublicReview } from '@app-types/domain';

export interface ReviewDetailsProps {
  review: PublicReview;
}

const useStyles = makeStyles((palette) => ({
  box: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    rowGap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.sm,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));

/** Ligne de détails d'un avis : recommandation, salaire, notes par critère. */
export function ReviewDetails({ review }: ReviewDetailsProps) {
  const { t } = useTranslation('reviews');
  const palette = useThemeColors();
  const styles = useStyles();
  const criteria = RATING_CRITERIA.filter((criterion) => review[`rating_${criterion}`] != null);

  if (criteria.length === 0 && review.salary_amount == null && review.recommends == null) return null;

  return (
    <View style={styles.box}>
      {review.recommends == null ? null : (
        <View style={styles.item}>
          <Feather
            name={review.recommends ? 'thumbs-up' : 'thumbs-down'}
            size={iconSize.sm}
            color={review.recommends ? palette.primary : palette.textMuted}
          />
          <Text variant="caption" tone="default">
            {review.recommends ? t('card.recommends') : t('card.notRecommends')}
          </Text>
        </View>
      )}
      {review.salary_amount != null && review.salary_period != null ? (
        <Text variant="caption" tone="default">
          {t('card.salary', {
            amount: formatInteger(review.salary_amount, getIntlTag()),
            period: t(`salaryPeriod.${review.salary_period}`),
          })}
        </Text>
      ) : null}
      {criteria.map((criterion) => (
        <Text key={criterion} variant="caption">
          {t(`criterion.${criterion}`)}{' '}
          <Text variant="caption" tone="default" weight="semibold">
            {t('card.criterionValue', { value: review[`rating_${criterion}`] })}
          </Text>
        </Text>
      ))}
    </View>
  );
}

export default ReviewDetails;
