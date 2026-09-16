import { memo } from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@components/ui/Avatar';
import { PressableScale } from '@components/ui/PressableScale';
import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { nafSectionFromCode } from '@utils/naf';
import type { Company } from '@app-types/domain';

export interface CompanyRowProps {
  company: Company;
  onPress: (company: Company) => void;
}

const useStyles = makeStyles((palette) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
    padding: spacing.md,
  },
  body: { flex: 1, gap: spacing.xxs },
  aside: { alignItems: 'flex-end', gap: spacing.xxs },
}));

function CompanyRowComponent({ company, onPress }: CompanyRowProps) {
  const { t } = useTranslation('companies');
  const styles = useStyles();
  const section = nafSectionFromCode(company.naf_code);
  const subtitle = [section ? t(`sectorShort.${section}`) : null, company.city].filter(Boolean).join(' · ');

  return (
    <PressableScale
      onPress={() => onPress(company)}
      accessibilityRole="link"
      accessibilityLabel={t('row.open', { name: company.name })}
      style={styles.row}>
      <Avatar name={company.name} />
      <View style={styles.body}>
        <Text variant="heading" numberOfLines={1}>
          {company.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {subtitle || t('row.noSector')}
        </Text>
      </View>
      <View style={styles.aside}>
        {company.review_count > 0 ? (
          <>
            <RatingBadge value={company.avg_overall} />
            <Text variant="tiny">{t('row.reviewCount', { count: company.review_count })}</Text>
          </>
        ) : (
          <Text variant="caption">{t('row.noReview')}</Text>
        )}
      </View>
    </PressableScale>
  );
}

export const CompanyRow = memo(CompanyRowComponent);
export default CompanyRow;
