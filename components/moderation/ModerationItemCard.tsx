import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { getIntlTag } from '@/i18n/currentLocale';
import { ReviewTextBlock } from '@components/reviews/ReviewTextBlock';
import { Card } from '@components/ui/Card';
import { LinkText } from '@components/ui/LinkText';
import { Pill } from '@components/ui/Pill';
import { StarRating } from '@components/ui/StarRating';
import { Text } from '@components/ui/Text';
import { iconSize, spacing } from '@constants/theme';
import { formatMonth } from '@utils/format';
import { reviewStatusKey } from '@utils/reviewStatus';
import type { ModerationDecision, ModerationItem } from '@app-types/domain';

import { ModerationDecisionBar } from './ModerationDecisionBar';
import { ModerationFlags } from './ModerationFlags';
import { ModerationReportList } from './ModerationReportList';

export interface ModerationItemCardProps {
  item: ModerationItem;
  onDecide: (item: ModerationItem, decision: ModerationDecision) => void;
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { gap: spacing.xs },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
});

function ModerationItemCardComponent({ item, onDecide }: ModerationItemCardProps) {
  const { t } = useTranslation(['account', 'reviews']);
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <LinkText href={`/company/${item.company_id}`} variant="label">
          {item.company_name}
        </LinkText>
        <View style={styles.meta}>
          <Pill label={t(`reviews:status.${reviewStatusKey(item)}`)} tone={item.status === 'published' ? 'neutral' : 'warning'} />
          <StarRating value={item.rating_overall} size={iconSize.sm} />
          <Text variant="caption">{t('moderation.receivedIn', { month: formatMonth(item.created_at, getIntlTag()) })}</Text>
        </View>
      </View>

      {item.reports.length > 0 ? <ModerationReportList reports={item.reports} /> : null}
      <ModerationFlags flags={item.moderation_flags} />

      <Text variant="heading">{item.title}</Text>
      {item.job_title ? <Text variant="caption">{t('moderation.jobTitle', { jobTitle: item.job_title })}</Text> : null}
      <ReviewTextBlock label={t('reviews:card.pros')} text={item.pros} icon="plus-circle" tone="success" />
      <ReviewTextBlock label={t('reviews:card.cons')} text={item.cons} icon="minus-circle" tone="danger" />
      {item.benefits ? <ReviewTextBlock label={t('reviews:card.benefits')} text={item.benefits} icon="gift" tone="primary" /> : null}

      <ModerationDecisionBar onDecide={(decision) => onDecide(item, decision)} />
    </Card>
  );
}

export const ModerationItemCard = memo(ModerationItemCardComponent);
export default ModerationItemCard;
