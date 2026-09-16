import { useCallback, type ReactElement } from 'react';
import { FlatList, StyleSheet, type ListRenderItemInfo } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ReviewCard } from '@components/reviews/ReviewCard';
import { Button } from '@components/ui/Button';
import { ContentColumn } from '@components/ui/ContentColumn';
import { EmptyState } from '@components/ui/EmptyState';
import { ListSeparator } from '@components/ui/ListSeparator';
import { LoadingState } from '@components/ui/LoadingState';
import { spacing } from '@constants/theme';
import { useScreenContentStyle } from '@hooks/useScreenContentStyle';
import { useThemeColors } from '@hooks/useThemeColors';
import type { PublicReview } from '@app-types/domain';

export interface CompanyReviewsListProps {
  reviews: PublicReview[];
  header: ReactElement;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onToggleHelpful: (review: PublicReview) => void;
  onMore: (review: PublicReview) => void;
}

const reviewKey = (review: PublicReview) => review.id;
const styles = StyleSheet.create({ footer: { paddingTop: spacing.lg } });

export function CompanyReviewsList({
  reviews,
  header,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onToggleHelpful,
  onMore,
}: CompanyReviewsListProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const contentStyle = useScreenContentStyle();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PublicReview>) => (
      <ContentColumn>
        <ReviewCard review={item} onToggleHelpful={onToggleHelpful} onMore={onMore} />
      </ContentColumn>
    ),
    [onToggleHelpful, onMore],
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={contentStyle}
      data={reviews}
      keyExtractor={reviewKey}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
      removeClippedSubviews
      ListHeaderComponent={header}
      ListEmptyComponent={
        isLoading ? (
          <LoadingState />
        ) : (
          <ContentColumn>
            <EmptyState icon="message-square" title={t('detail.noReviews')} message={t('detail.noReviewsHint')} />
          </ContentColumn>
        )
      }
      ListFooterComponent={
        hasNextPage ? (
          <ContentColumn style={styles.footer}>
            <Button variant="secondary" label={t('detail.loadMore')} loading={isFetchingNextPage} onPress={onLoadMore} />
          </ContentColumn>
        ) : null
      }
    />
  );
}

export default CompanyReviewsList;
