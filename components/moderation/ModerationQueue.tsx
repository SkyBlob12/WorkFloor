import { useCallback } from 'react';
import { FlatList, type ListRenderItemInfo } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { ContentColumn } from '@components/ui/ContentColumn';
import { EmptyState } from '@components/ui/EmptyState';
import { ListSeparator } from '@components/ui/ListSeparator';
import { LoadingState } from '@components/ui/LoadingState';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useErrorMessage } from '@hooks/useErrorMessage';
import { useModerationQueue } from '@hooks/useModeration';
import { useModerationDecisions } from '@hooks/useModerationDecisions';
import { useScreenContentStyle } from '@hooks/useScreenContentStyle';
import type { ModerationItem } from '@app-types/domain';

import { ModerationItemCard } from './ModerationItemCard';

const itemKey = (item: ModerationItem) => item.review_id;

const useStyles = makeStyles((palette) => ({
  list: { flex: 1, backgroundColor: palette.background },
  header: { gap: spacing.xs, paddingTop: spacing.md, paddingBottom: spacing.md },
}));

/** File de modération : avis en relecture humaine et avis signalés, du plus ancien au plus récent. */
export function ModerationQueue() {
  const { t } = useTranslation(['account', 'common']);
  const styles = useStyles();
  const contentStyle = useScreenContentStyle();
  const errorMessage = useErrorMessage();
  const { data, isLoading, error, refetch, isRefetching } = useModerationQueue(true);
  const { visibleItems, decide } = useModerationDecisions(data);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ModerationItem>) => (
      <ContentColumn width="reading">
        <ModerationItemCard item={item} onDecide={decide} />
      </ContentColumn>
    ),
    [decide],
  );

  if (isLoading) return <LoadingState />;

  const empty = error ? (
    <EmptyState
      icon="alert-circle"
      title={errorMessage(error)}
      action={<Button variant="secondary" label={t('common:action.retry')} loading={isRefetching} onPress={() => void refetch()} />}
    />
  ) : (
    <EmptyState icon="check-circle" title={t('moderation.emptyTitle')} message={t('moderation.emptyMessage')} />
  );

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={contentStyle}
      data={visibleItems}
      keyExtractor={itemKey}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
      removeClippedSubviews
      onRefresh={() => void refetch()}
      refreshing={isRefetching}
      ListHeaderComponent={
        <ContentColumn width="reading" style={styles.header}>
          <Text variant="display" accessibilityRole="header">
            {t('moderation.title')}
          </Text>
          {visibleItems.length > 0 ? <Text variant="caption">{t('moderation.count', { count: visibleItems.length })}</Text> : null}
        </ContentColumn>
      }
      ListEmptyComponent={<ContentColumn width="reading">{empty}</ContentColumn>}
    />
  );
}

export default ModerationQueue;
