import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CompanyHeader } from '@components/companies/CompanyHeader';
import { CompanyNotFound } from '@components/companies/CompanyNotFound';
import { CompanyReviewsList } from '@components/companies/CompanyReviewsList';
import { CompanySummary } from '@components/companies/CompanySummary';
import { CompanyWideLayout } from '@components/companies/CompanyWideLayout';
import { ReviewsListHeader } from '@components/companies/ReviewsListHeader';
import { PageHead } from '@components/shell/PageHead';
import { ActionSheet } from '@components/ui/ActionSheet';
import { ContentColumn } from '@components/ui/ContentColumn';
import { LoadingState } from '@components/ui/LoadingState';
import { useCompany } from '@hooks/useCompany';
import { useCompanyCityStats } from '@hooks/useCompanyCityStats';
import { useCompanyReviews } from '@hooks/useCompanyReviews';
import { useLayout } from '@hooks/useLayout';
import { useMyReview } from '@hooks/useMyReview';
import { useRequireAuth } from '@hooks/useRequireAuth';
import { useReviewActions } from '@hooks/useReviewActions';
import { spacing } from '@constants/theme';
import type { ReviewSort } from '@app-types/domain';

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingBottom: spacing.md },
  headerNarrow: { paddingTop: spacing.sm },
  headerWide: { paddingTop: spacing.xl },
});

export default function CompanyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['companies', 'reviews']);
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const { isWide } = useLayout();
  const [sort, setSort] = useState<ReviewSort>('recent');
  const [city, setCity] = useState<string | null>(null);
  const company = useCompany(id);
  const myReview = useMyReview(id);
  const cities = useCompanyCityStats(id);
  const reviews = useCompanyReviews(id, sort, city);
  const actions = useReviewActions(id);

  const visibleReviews = useMemo(
    () => reviews.reviews.filter((review) => !actions.hiddenIds.has(review.id)),
    [reviews.reviews, actions.hiddenIds],
  );

  if (company.isLoading) return <LoadingState />;
  if (!company.data) return <CompanyNotFound />;

  const data = company.data;
  const summary = (
    <CompanySummary
      company={data}
      myReview={myReview.data ?? null}
      onWrite={() => requireAuth() && router.push(`/company/${data.id}/review`)}
    />
  );
  const list = (
    <CompanyReviewsList
      reviews={visibleReviews}
      header={
        <ContentColumn style={[styles.header, isWide ? styles.headerWide : styles.headerNarrow]}>
          <CompanyHeader company={data} />
          {isWide ? null : summary}
          <ReviewsListHeader
            count={data.review_count}
            sort={sort}
            onSortChange={setSort}
            cities={cities.data ?? []}
            city={city}
            onCityChange={setCity}
          />
        </ContentColumn>
      }
      isLoading={reviews.isLoading}
      hasNextPage={reviews.hasNextPage}
      isFetchingNextPage={reviews.isFetchingNextPage}
      onLoadMore={reviews.fetchNextPage}
      onToggleHelpful={actions.toggleHelpful}
      onMore={actions.openSheet}
    />
  );

  return (
    <>
      <PageHead
        title={t('detail.pageTitle', { name: data.name })}
        description={t('detail.metaDescription', { count: data.review_count, name: data.name })}
        headerTitle={data.name}
      />
      {isWide ? <CompanyWideLayout sidebar={summary}>{list}</CompanyWideLayout> : list}
      <ActionSheet
        visible={actions.sheetReview !== null}
        title={actions.sheetReview?.is_mine ? t('reviews:actions.sheetTitleMine') : t('reviews:actions.sheetTitleOther')}
        actions={actions.sheetActions}
        onDismiss={actions.closeSheet}
      />
    </>
  );
}
