import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { getIntlTag } from '@/i18n/currentLocale';
import { Notice } from '@components/ui/Notice';
import { StarRating } from '@components/ui/StarRating';
import { Text } from '@components/ui/Text';
import { iconSize, spacing } from '@constants/theme';
import { formatRating } from '@utils/format';
import type { Company } from '@app-types/domain';

export interface CompanyScoreProps {
  company: Company;
}

const styles = StyleSheet.create({
  score: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stack: { gap: spacing.xxs },
});

/** Note globale de la fiche, et notice quand une activité inhabituelle gèle les avis récents. */
export function CompanyScore({ company }: CompanyScoreProps) {
  const { t } = useTranslation('companies');

  const score =
    company.avg_overall != null ? (
      <View style={styles.score}>
        <Text variant="display">{formatRating(company.avg_overall, getIntlTag())}</Text>
        <View style={styles.stack}>
          <StarRating value={company.avg_overall} size={iconSize.lg} />
          <Text variant="caption">{t('detail.basedOn', { count: company.review_count })}</Text>
        </View>
      </View>
    ) : (
      <View style={styles.stack}>
        <Text variant="heading">{company.review_count > 0 ? t('detail.ratingOnHold') : t('detail.noRating')}</Text>
        {company.review_count > 0 ? null : <Text variant="caption">{t('detail.noReviewsHint')}</Text>}
      </View>
    );

  return (
    <>
      {score}
      {company.under_review ? (
        <Notice tone="warning" title={t('detail.underReviewTitle')}>
          {t('detail.underReviewMessage')}
        </Notice>
      ) : null}
    </>
  );
}

export default CompanyScore;
