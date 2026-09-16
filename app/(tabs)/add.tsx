import { useLocalSearchParams } from 'expo-router';

import { AddCompanyContent } from '@components/companies/AddCompanyContent';

export default function AddCompanyScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  // La clé remonte le contenu quand on arrive avec une nouvelle recherche pré-remplie.
  return <AddCompanyContent key={q ?? ''} initialQuery={q ?? ''} />;
}
