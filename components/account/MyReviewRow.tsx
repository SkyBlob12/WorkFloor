import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@components/ui/IconButton';
import { PressableScale } from '@components/ui/PressableScale';
import { StarRating } from '@components/ui/StarRating';
import { Text } from '@components/ui/Text';
import { iconSize, spacing } from '@constants/theme';
import { reviewStatusKey } from '@utils/reviewStatus';
import type { OwnReview } from '@app-types/domain';

export interface MyReviewRowProps {
  review: OwnReview;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  link: { flex: 1, gap: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

function MyReviewRowComponent({ review }: MyReviewRowProps) {
  const { t } = useTranslation(['account', 'reviews']);
  const router = useRouter();
  const companyName = review.company?.name ?? t('myReviews.unknownCompany');
  return (
    <View style={styles.row}>
      <PressableScale
        onPress={() => router.push(`/company/${review.company_id}`)}
        accessibilityRole="link"
        accessibilityLabel={t('myReviews.open', { name: companyName })}
        style={styles.link}>
        <Text variant="label" numberOfLines={1}>
          {companyName}
        </Text>
        <View style={styles.meta}>
          <StarRating value={review.rating_overall} size={iconSize.sm} />
          <Text variant="caption" tone={review.status === 'published' ? 'muted' : 'warning'}>
            {t(`reviews:status.${reviewStatusKey(review)}`)}
          </Text>
        </View>
      </PressableScale>
      <IconButton icon="edit-2" accessibilityLabel={t('myReviews.edit')} onPress={() => router.push(`/company/${review.company_id}/review`)} />
    </View>
  );
}

export const MyReviewRow = memo(MyReviewRowComponent);
export default MyReviewRow;
