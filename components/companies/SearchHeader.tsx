import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Wordmark } from '@components/navigation/Wordmark';
import { ContentColumn } from '@components/ui/ContentColumn';
import { SearchInput } from '@components/ui/SearchInput';
import { Text } from '@components/ui/Text';
import { layout, spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';
import type { DirectoryTotals } from '@utils/companyDirectory';

export interface SearchHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  totals: DirectoryTotals;
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  headerWide: { gap: spacing.lg, paddingTop: spacing.xxl },
  intro: { gap: spacing.xs, paddingTop: spacing.sm },
  constrained: { maxWidth: layout.heroMaxWidth },
});

/** En-tête de l'accueil : la recherche est l'action principale, le compteur donne de l'élan. */
export function SearchHeader({ query, onQueryChange, totals }: SearchHeaderProps) {
  const { t } = useTranslation('companies');
  const { isWide } = useLayout();
  return (
    <ContentColumn style={[styles.header, isWide && styles.headerWide]}>
      {isWide ? null : <Wordmark />}
      <View style={[styles.intro, styles.constrained]}>
        <Text variant={isWide ? 'displayWide' : 'display'} accessibilityRole="header">
          {t('search.headline')}
        </Text>
        <Text variant="body" tone="muted">
          {t('search.intro')}
        </Text>
        {totals.reviews > 0 ? (
          <Text variant="label" tone="primary">
            {t('home.stats', {
              reviews: t('home.statsReviews', { count: totals.reviews }),
              companies: t('home.statsCompanies', { count: totals.companies }),
            })}
          </Text>
        ) : null}
      </View>
      <View style={styles.constrained}>
        <SearchInput value={query} onChangeText={onQueryChange} placeholder={t('search.placeholder')} />
      </View>
    </ContentColumn>
  );
}

export default SearchHeader;
