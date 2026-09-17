import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@components/ui/Text';
import { SITE_RESULTS_SHOWN } from '@constants/companies';
import { spacing } from '@constants/theme';
import { useErrorMessage } from '@hooks/useErrorMessage';
import { useThemeColors } from '@hooks/useThemeColors';
import type { CompanySite } from '@app-types/domain';

import { SiteOption } from './SiteOption';

export interface SiteSearchResultsProps {
  sites: CompanySite[] | undefined;
  loading: boolean;
  error: unknown;
  onSelect: (site: CompanySite) => void;
}

const styles = StyleSheet.create({ list: { gap: spacing.xs } });

export function SiteSearchResults({ sites, loading, error, onSelect }: SiteSearchResultsProps) {
  const { t } = useTranslation('reviews');
  const palette = useThemeColors();
  const errorMessage = useErrorMessage();

  if (loading) return <ActivityIndicator color={palette.primary} />;
  if (error) {
    return (
      <Text variant="caption" tone="danger">
        {errorMessage(error)}
      </Text>
    );
  }
  if (!sites) return null;
  if (sites.length === 0) return <Text variant="caption">{t('form.siteNoResult')}</Text>;

  const hidden = sites.length - SITE_RESULTS_SHOWN;
  return (
    <View style={styles.list}>
      {sites.slice(0, SITE_RESULTS_SHOWN).map((site) => (
        <SiteOption key={site.siret} site={site} onSelect={onSelect} />
      ))}
      {hidden > 0 ? <Text variant="caption">{t('form.siteMore', { count: hidden })}</Text> : null}
    </View>
  );
}

export default SiteSearchResults;
