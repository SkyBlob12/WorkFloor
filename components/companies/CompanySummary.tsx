import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { RatingBar } from '@components/ui/RatingBar';
import { Text } from '@components/ui/Text';
import { RATING_CRITERIA } from '@constants/reviews';
import { iconSize, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { useOnboardingStore } from '@stores/onboardingStore';
import { sortCriteriaByPriority } from '@utils/onboarding';
import { reviewStatusKey } from '@utils/reviewStatus';
import type { Company, OwnReview } from '@app-types/domain';

import { CompanyScore } from './CompanyScore';

export interface CompanySummaryProps {
  company: Company;
  myReview: OwnReview | null;
  onWrite: () => void;
}

const useStyles = makeStyles((palette) => ({
  card: { gap: spacing.lg },
  group: { gap: spacing.sm },
  recommend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.successMuted,
    padding: spacing.sm,
  },
  grow: { flex: 1 },
  anonymous: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
}));

export function CompanySummary({ company, myReview, onWrite }: CompanySummaryProps) {
  const { t } = useTranslation(['companies', 'reviews']);
  const palette = useThemeColors();
  const styles = useStyles();
  const priorities = useOnboardingStore((state) => state.priorities);
  const hasReviews = company.review_count > 0;

  return (
    <Card style={styles.card}>
      <CompanyScore company={company} />

      {company.recommend_pct != null ? (
        <View style={styles.recommend}>
          <Feather name="thumbs-up" size={iconSize.md} color={palette.success} />
          <Text variant="label" style={styles.grow}>
            {t('detail.recommendPct', { value: company.recommend_pct })}
          </Text>
        </View>
      ) : null}

      {hasReviews ? (
        <View style={styles.group}>
          {sortCriteriaByPriority(RATING_CRITERIA, priorities).map((criterion) => (
            <RatingBar
              key={criterion}
              label={t(`reviews:criterion.${criterion}`)}
              value={company[`avg_${criterion}`]}
              highlighted={priorities.includes(criterion)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.group}>
        <Button label={myReview ? t('detail.editReview') : t('detail.writeReview')} icon={myReview ? 'edit-2' : 'edit-3'} onPress={onWrite} />
        {myReview && myReview.status !== 'published' ? (
          <Text variant="caption" tone="warning" align="center">
            {t('detail.myReviewStatus', { status: t(`reviews:status.${reviewStatusKey(myReview)}`) })}
          </Text>
        ) : null}
        <View style={styles.anonymous}>
          <Feather name="lock" size={iconSize.xs} color={palette.textMuted} />
          <Text variant="caption">{t('detail.anonymous')}</Text>
        </View>
      </View>
    </Card>
  );
}

export default CompanySummary;
