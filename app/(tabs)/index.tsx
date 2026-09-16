import { useCallback } from 'react';
import { FlatList, type ListRenderItemInfo } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CompanyRow } from '@components/companies/CompanyRow';
import { DiscoverSections } from '@components/companies/DiscoverSections';
import { EmptySearchState } from '@components/companies/EmptySearchState';
import { ResultsHeader } from '@components/companies/ResultsHeader';
import { SearchHeader } from '@components/companies/SearchHeader';
import { PageHead } from '@components/shell/PageHead';
import { ContentColumn } from '@components/ui/ContentColumn';
import { ListSeparator } from '@components/ui/ListSeparator';
import { useCompanyExplorer } from '@hooks/useCompanyExplorer';
import { useScreenContentStyle } from '@hooks/useScreenContentStyle';
import { useThemeColors } from '@hooks/useThemeColors';
import { hasActiveFilters } from '@utils/companyDirectory';
import type { Company } from '@app-types/domain';

const companyKey = (company: Company) => company.id;

export default function SearchScreen() {
  const { t } = useTranslation('companies');
  const router = useRouter();
  const palette = useThemeColors();
  const explorer = useCompanyExplorer();
  const contentStyle = useScreenContentStyle(true);

  const openCompany = useCallback((company: Company) => router.push(`/company/${company.id}`), [router]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Company>) => (
      <ContentColumn>
        <CompanyRow company={item} onPress={openCompany} />
      </ContentColumn>
    ),
    [openCompany],
  );

  return (
    <>
      <PageHead title={t('search.pageTitle')} bare />
      <FlatList
        style={{ flex: 1, backgroundColor: palette.background }}
        contentContainerStyle={contentStyle}
        data={explorer.items}
        keyExtractor={companyKey}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        ListHeaderComponent={
          <>
            <SearchHeader query={explorer.query} onQueryChange={explorer.setQuery} totals={explorer.totals} />
            {explorer.mode === 'discover' ? (
              <DiscoverSections explorer={explorer} onOpenCompany={openCompany} />
            ) : (
              <ResultsHeader explorer={explorer} />
            )}
          </>
        }
        ListEmptyComponent={
          explorer.ready ? (
            <ContentColumn>
              <EmptySearchState
                term={explorer.term}
                filtered={hasActiveFilters(explorer.filters)}
                onClearFilters={explorer.clearFilters}
              />
            </ContentColumn>
          ) : null
        }
      />
    </>
  );
}
