import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@components/ui/Avatar';
import { PressableScale } from '@components/ui/PressableScale';
import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { NAF_SECTIONS, SECTOR_ICONS } from '@constants/companies';
import { iconSize, motion, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import { nafSectionFromCode } from '@utils/naf';
import { tintAt, tintFor } from '@utils/tint';
import type { Company } from '@app-types/domain';

export interface FeaturedCompanyCardProps {
  company: Company;
  onPress: (company: Company) => void;
  /** Photo du secteur, la même que sur la carte de secteur. Absente ou en échec : pictogramme teinté. */
  photoUrl?: string;
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
    overflow: 'hidden',
  },
  body: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md, marginTop: -spacing.lg },
  names: { gap: spacing.xxs },
  recommend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));

const layout = StyleSheet.create({
  fill: StyleSheet.absoluteFill,
  badge: { marginLeft: 'auto' },
});

/** Carte mise en avant (carrousel « Les mieux notées ») : couverture du secteur (photo ou teinte), monogramme en chevauchement. */
function FeaturedCompanyCardComponent({ company, onPress, photoUrl }: FeaturedCompanyCardProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const styles = useStyles();
  const section = nafSectionFromCode(company.naf_code);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  // Même teinte que la carte du secteur ; sans secteur, teinte stable selon le nom.
  const tint = section ? tintAt(NAF_SECTIONS.indexOf(section)) : tintFor(company.name);
  const showPhoto = Boolean(photoUrl) && failedUrl !== photoUrl;
  const subtitle = [section ? t(`sectorShort.${section}`) : null, company.city].filter(Boolean).join(' · ');

  return (
    <PressableScale
      onPress={() => onPress(company)}
      accessibilityRole="link"
      accessibilityLabel={t('row.open', { name: company.name })}
      style={styles.card}>
      <View style={[styles.cover, { backgroundColor: palette[tint.background] }]}>
        {showPhoto ? (
          <Image
            source={{ uri: photoUrl }}
            contentFit="cover"
            transition={motion.imageFade}
            onError={() => setFailedUrl(photoUrl ?? null)}
            style={layout.fill}
            accessible={false}
          />
        ) : (
          <Feather name={section ? SECTOR_ICONS[section] : 'briefcase'} size={iconSize.lg} color={palette[tint.foreground]} />
        )}
        <View style={layout.badge}>
          <RatingBadge value={company.avg_overall} />
        </View>
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
