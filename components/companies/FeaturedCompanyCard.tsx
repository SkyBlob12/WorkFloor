import { memo } from 'react';
import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@components/ui/Avatar';
import { PressableScale } from '@components/ui/PressableScale';
import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { SECTOR_ICONS } from '@constants/companies';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { nafSectionFromCode } from '@utils/naf';
import { tintFor } from '@utils/tint';
import type { Company } from '@app-types/domain';

export interface FeaturedCompanyCardProps {
  company: Company;
  onPress: (company: Company) => void;
}

const useStyles = makeStyles((palette) => ({
  card: {
    width: size.featuredCard,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: palette.surface,
  },
  cover: {
    height: size.cardCover,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  body: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md, marginTop: -spacing.lg },
  names: { gap: spacing.xxs },
  recommend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));

/** Carte mise en avant (carrousel « Les mieux notées ») : couverture teintée, monogramme en chevauchement. */
function FeaturedCompanyCardComponent({ company, onPress }: FeaturedCompanyCardProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const styles = useStyles();
  const section = nafSectionFromCode(company.naf_code);
  const tint = tintFor(company.name);
  const subtitle = [section ? t(`sectorShort.${section}`) : null, company.city].filter(Boolean).join(' · ');

  return (
    <PressableScale
      onPress={() => onPress(company)}
      accessibilityRole="link"
      accessibilityLabel={t('row.open', { name: company.name })}
      style={styles.card}>
      <View style={[styles.cover, { backgroundColor: palette[tint.background] }]}>
        <Feather name={section ? SECTOR_ICONS[section] : 'briefcase'} size={iconSize.lg} color={palette[tint.foreground]} />
        <RatingBadge value={company.avg_overall} />
      </View>
      <View style={styles.body}>
        <Avatar name={company.name} ringed />
        <View style={styles.names}>
          <Text variant="heading" numberOfLines={1}>
            {company.name}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {subtitle || t('row.noSector')}
          </Text>
        </View>
        {company.recommend_pct != null ? (
          <View style={styles.recommend}>
            <Feather name="thumbs-up" size={iconSize.xs} color={palette.success} />
            <Text variant="caption" tone="success" weight="semibold">
              {t('home.recommendShort', { value: company.recommend_pct })}
            </Text>
          </View>
        ) : null}
        <Text variant="tiny">{t('row.reviewCount', { count: company.review_count })}</Text>
      </View>
    </PressableScale>
  );
}

export const FeaturedCompanyCard = memo(FeaturedCompanyCardComponent);
export default FeaturedCompanyCard;
