import { ActivityIndicator, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { ContentColumn } from '@components/ui/ContentColumn';
import { PressableScale } from '@components/ui/PressableScale';
import { SectionHeader } from '@components/ui/SectionHeader';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import type { CompanyExplorerState } from '@hooks/useCompanyExplorer';
import { useThemeColors } from '@hooks/useThemeColors';
import { hasActiveFilters } from '@utils/companyDirectory';

export interface ResultsHeaderProps {
  explorer: CompanyExplorerState;
}

const useStyles = makeStyles((palette) => ({
  header: { gap: spacing.md, paddingBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    height: size.controlSmall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: palette.primaryMuted,
    paddingHorizontal: spacing.md,
  },
  count: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
}));

/** En-tête des résultats : filtres actifs retirables et nombre d'entreprises trouvées. */
export function ResultsHeader({ explorer }: ResultsHeaderProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const styles = useStyles();
  const { filters } = explorer;
  const active = [
    filters.sector ? { key: 'sector', label: t(`sectorShort.${filters.sector}`), onRemove: explorer.toggleSector.bind(null, filters.sector) } : null,
    filters.city ? { key: 'city', label: filters.city, onRemove: explorer.toggleCity.bind(null, filters.city) } : null,
  ].filter((item) => item !== null);

  return (
    <ContentColumn style={styles.header}>
      {hasActiveFilters(filters) ? (
        <>
          <SectionHeader title={t('home.filtersTitle')} action={{ label: t('home.clearFilters'), onPress: explorer.clearFilters }} />
          <View style={styles.chips}>
            {active.map((filter) => (
              <PressableScale
                key={filter.key}
                onPress={filter.onRemove}
                accessibilityRole="button"
                accessibilityLabel={t('home.removeFilter', { label: filter.label })}
                style={styles.chip}>
                <Text variant="caption" tone="primary" weight="semibold">
                  {filter.label}
                </Text>
                <Feather name="x" size={iconSize.sm} color={palette.primary} />
              </PressableScale>
            ))}
          </View>
        </>
      ) : null}
      <View style={styles.count}>
        <Text variant="heading" accessibilityLiveRegion="polite">
          {t('home.results', { count: explorer.items.length })}
        </Text>
        {explorer.loading ? <ActivityIndicator size="small" color={palette.textMuted} /> : null}
      </View>
    </ContentColumn>
  );
}

export default ResultsHeader;
