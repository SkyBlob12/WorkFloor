import { useCallback, useState } from 'react';
import { FlatList, type ListRenderItemInfo } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PageHead } from '@components/shell/PageHead';
import { ContentColumn } from '@components/ui/ContentColumn';
import { EmptyState } from '@components/ui/EmptyState';
import { ListSeparator } from '@components/ui/ListSeparator';
import { SIRENE_DEBOUNCE_MS, SIRENE_MIN_QUERY_LENGTH } from '@constants/companies';
import { useCreateCompany } from '@hooks/useCreateCompany';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useRequireAuth } from '@hooks/useRequireAuth';
import { useScreenContentStyle } from '@hooks/useScreenContentStyle';
import { useSireneSearch } from '@hooks/useSireneSearch';
import { useThemeColors } from '@hooks/useThemeColors';
import type { SireneCompany } from '@app-types/domain';

import { AddCompanyHeader } from './AddCompanyHeader';
import { SireneRow } from './SireneRow';

export interface AddCompanyContentProps {
  initialQuery: string;
}

const sirenKey = (company: SireneCompany) => company.siren;

export function AddCompanyContent({ initialQuery }: AddCompanyContentProps) {
  const { t } = useTranslation('companies');
  const router = useRouter();
  const palette = useThemeColors();
  const requireAuth = useRequireAuth();
  const [query, setQuery] = useState(initialQuery);
  const term = useDebouncedValue(query.trim(), SIRENE_DEBOUNCE_MS);
  const search = useSireneSearch(term);
  const createCompany = useCreateCompany();
  const contentStyle = useScreenContentStyle(true);
  const searchable = term.length >= SIRENE_MIN_QUERY_LENGTH;
  const creatingSiren = createCompany.isPending ? createCompany.variables : null;

  const select = useCallback(
    (company: SireneCompany) => {
      if (!requireAuth()) return;
      createCompany.mutate(company.siren, { onSuccess: ({ id }) => router.push(`/company/${id}`) });
    },
    [requireAuth, createCompany, router],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SireneCompany>) => (
      <ContentColumn width="reading">
        <SireneRow company={item} busy={creatingSiren === item.siren} disabled={creatingSiren !== null} onPress={select} />
      </ContentColumn>
    ),
    [creatingSiren, select],
  );

  return (
    <>
      <PageHead title={t('add.pageTitle')} />
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: palette.background }}
        contentContainerStyle={contentStyle}
        data={searchable ? (search.data ?? []) : []}
        keyExtractor={sirenKey}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        ListHeaderComponent={
          <AddCompanyHeader query={query} onQueryChange={setQuery} term={term} loading={search.isFetching} />
        }
        ListEmptyComponent={
          searchable && !search.isFetching ? (
            <ContentColumn width="reading">
              <EmptyState icon="search" title={t('add.noResult')} />
            </ContentColumn>
          ) : null
        }
      />
    </>
  );
}

export default AddCompanyContent;
