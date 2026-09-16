import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@components/ui/SegmentedControl';
import { Text } from '@components/ui/Text';
import { REVIEW_SORTS } from '@constants/reviews';
import { spacing } from '@constants/theme';
import type { ReviewSort } from '@app-types/domain';

export interface ReviewsListHeaderProps {
  count: number;
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
}

const styles = StyleSheet.create({ header: { gap: spacing.sm, paddingTop: spacing.md } });

export function ReviewsListHeader({ count, sort, onSortChange }: ReviewsListHeaderProps) {
  const { t } = useTranslation('companies');
  return (
    <View style={styles.header}>
      <Text variant="title">{t('detail.reviewCount', { count })}</Text>
      {count > 1 ? (
        <SegmentedControl<ReviewSort>
          label={t('detail.sortLabel')}
          value={sort}
          onChange={onSortChange}
          options={REVIEW_SORTS.map((value) => ({ value, label: t(`detail.sort.${value}`) }))}
        />
      ) : null}
    </View>
  );
}

export default ReviewsListHeader;
