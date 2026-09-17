import { memo } from 'react';
import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Pill } from '@components/ui/Pill';
import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { iconSize, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { CompanySite } from '@app-types/domain';

export interface SiteOptionProps {
  site: CompanySite;
  onSelect: (site: CompanySite) => void;
}

const useStyles = makeStyles((palette) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.sm,
  },
  body: { flex: 1, gap: spacing.xxs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
}));

function SiteOptionComponent({ site, onSelect }: SiteOptionProps) {
  const { t } = useTranslation('reviews');
  const palette = useThemeColors();
  const styles = useStyles();
  const place =
    site.city && site.postalCode ? t('form.sitePlace', { city: site.city, postalCode: site.postalCode }) : (site.city ?? site.siret);

  return (
    <PressableScale
      onPress={() => onSelect(site)}
      accessibilityRole="button"
      accessibilityLabel={t('form.siteSelect', { place })}
      style={styles.row}>
      <Feather name="map-pin" size={iconSize.md} color={palette.primary} />
      <View style={styles.body}>
        <Text variant="label">{place}</Text>
        {site.address ? (
          <Text variant="caption" numberOfLines={1}>
            {site.address}
          </Text>
        ) : null}
        {site.isHeadquarters || !site.isActive ? (
          <View style={styles.pills}>
            {site.isHeadquarters ? <Pill label={t('form.siteHeadquarters')} /> : null}
            {site.isActive ? null : <Pill tone="warning" label={t('form.siteClosed')} />}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

export const SiteOption = memo(SiteOptionComponent);
export default SiteOption;
