import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Wordmark } from '@components/navigation/Wordmark';
import { ContentColumn } from '@components/ui/ContentColumn';
import { SearchInput } from '@components/ui/SearchInput';
import { Text } from '@components/ui/Text';
import { layout, spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';
import type { DirectoryTotals } from '@utils/companyDirectory';

import { HomeHeroScene } from './HomeHeroScene';

export interface SearchHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  totals: DirectoryTotals;
  /** Illustration affichée seulement sur l'accueil, pas pendant une recherche. */
  showScene: boolean;
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  headerWide: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, paddingTop: spacing.xxl },
  main: { gap: spacing.md },
  mainWide: { flex: 1, gap: spacing.lg },
  intro: { gap: spacing.xs, paddingTop: spacing.sm },
  constrained: { maxWidth: layout.heroMaxWidth },
  aside: { flex: 1 },
});

/** En-tête de l'accueil : la recherche est l'action principale, l'illustration et le compteur donnent envie. */
export function SearchHeader({ query, onQueryChange, totals, showScene }: SearchHeaderProps) {
  const { t } = useTranslation('companies');
  const { isWide } = useLayout();
  return (
    <ContentColumn style={[styles.header, isWide && styles.headerWide]}>
      <View style={isWide ? styles.mainWide : styles.main}>
        {isWide ? null : <Wordmark />}
        {showScene && !isWide ? <HomeHeroScene /> : null}
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
      </View>
      {showScene && isWide ? (
        <View style={styles.aside}>
          <HomeHeroScene wide />
        </View>
      ) : null}
    </ContentColumn>
  );
}

export default SearchHeader;
