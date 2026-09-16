import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthRequired } from '@components/auth/AuthRequired';
import { CompanyNotFound } from '@components/companies/CompanyNotFound';
import { ReviewForm } from '@components/reviews/ReviewForm';
import { LoadingState } from '@components/ui/LoadingState';
import { Screen } from '@components/ui/Screen';
import { useAuthInitializing, useAuthUser } from '@hooks/useAuthUser';
import { useCompany } from '@hooks/useCompany';
import { useMyReview } from '@hooks/useMyReview';

export default function ReviewFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('reviews');
  const user = useAuthUser();
  const initializing = useAuthInitializing();
  const company = useCompany(id);
  const myReview = useMyReview(id);

  if (initializing || company.isLoading || (user && myReview.isLoading)) return <LoadingState />;

  if (!user) {
    return (
      <Screen width="reading">
        <AuthRequired title={t('form.authTitle')} message={t('form.authMessage')} />
      </Screen>
    );
  }

  if (!company.data) return <CompanyNotFound />;

  // La clé réinitialise le formulaire si l'avis existant change (ex. après connexion).
  return (
    <ReviewForm
      key={myReview.data?.id ?? 'new'}
      company={company.data}
      initialReview={myReview.data ?? null}
    />
  );
}
