import { memo } from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { getIntlTag } from '@/i18n/currentLocale';
import { IconButton } from '@components/ui/IconButton';
import { Pill } from '@components/ui/Pill';
import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { formatMonth } from '@utils/format';
import type { PublicReview } from '@app-types/domain';

import { HelpfulButton } from './HelpfulButton';
import { ReviewDetails } from './ReviewDetails';
import { ReviewTextBlock } from './ReviewTextBlock';

export interface ReviewCardProps {
  review: PublicReview;
  onToggleHelpful: (review: PublicReview) => void;
  onMore: (review: PublicReview) => void;
}

const useStyles = makeStyles((palette) => ({
  card: { gap: spacing.md, borderRadius: radius.lg, backgroundColor: palette.surface, padding: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { flex: 1 },
  heading: { gap: spacing.xxs },
  row: { flexDirection: 'row' },
}));

function ReviewCardComponent({ review, onToggleHelpful, onMore }: ReviewCardProps) {
  const { t } = useTranslation('reviews');
  const styles = useStyles();
  const month = formatMonth(review.published_month, getIntlTag());
  const meta = [
    t(`employmentStatus.${review.employment_status}`),
    review.contract_type ? t(`contractType.${review.contract_type}`) : null,
    review.job_title,
    review.site_city,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <RatingBadge value={review.rating_overall} />
        <Text variant="caption" style={styles.date} numberOfLines={1}>
          {review.is_edited ? t('card.dateEdited', { month }) : month}
        </Text>
        {review.is_mine ? <Pill tone="primary" label={t('card.mine')} /> : null}
        <IconButton
          icon="more-horizontal"
          color="textMuted"
          accessibilityLabel={review.is_mine ? t('card.moreMine') : t('card.moreOther')}
          onPress={() => onMore(review)}
        />
      </View>

      <View style={styles.heading}>
        <Text variant="heading">{review.title}</Text>
        {meta ? <Text variant="caption">{meta}</Text> : null}
      </View>

      <ReviewTextBlock label={t('card.pros')} text={review.pros} icon="plus-circle" tone="success" />
      <ReviewTextBlock label={t('card.cons')} text={review.cons} icon="minus-circle" tone="danger" />
      {review.benefits ? <ReviewTextBlock label={t('card.benefits')} text={review.benefits} icon="gift" tone="primary" /> : null}
      <ReviewDetails review={review} />

      {review.is_mine ? (
        <Text variant="caption">{t('card.helpfulSummary', { count: review.helpful_count })}</Text>
      ) : (
        <View style={styles.row}>
          <HelpfulButton voted={review.voted_helpful} count={review.helpful_count} onPress={() => onToggleHelpful(review)} />
        </View>
      )}
    </View>
  );
}

export const ReviewCard = memo(ReviewCardComponent);
export default ReviewCard;
