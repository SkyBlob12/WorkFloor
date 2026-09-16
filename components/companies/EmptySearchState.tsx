import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';

export interface EmptySearchStateProps {
  term: string;
  /** Aucun résultat à cause des filtres secteur / ville. */
  filtered?: boolean;
  onClearFilters?: () => void;
}

export function EmptySearchState({ term, filtered = false, onClearFilters }: EmptySearchStateProps) {
  const { t } = useTranslation('companies');
  const router = useRouter();

  if (filtered && onClearFilters) {
    return (
      <EmptyState
        icon="filter"
        title={t('home.noMatch')}
        action={<Button size="sm" variant="secondary" icon="x" label={t('home.clearFilters')} onPress={onClearFilters} />}
      />
    );
  }

  return (
    <EmptyState
      icon={term ? 'search' : 'briefcase'}
      title={term ? t('search.noResult', { term }) : t('search.empty')}
      message={t('search.emptyHint')}
      action={
        <Button
          size="sm"
          icon="plus"
          label={t('search.addCta')}
          onPress={() => router.push({ pathname: '/add', params: term ? { q: term } : {} })}
        />
      }
    />
  );
}

export default EmptySearchState;
