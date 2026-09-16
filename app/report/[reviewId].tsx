import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthRequired } from '@components/auth/AuthRequired';
import { ReportForm } from '@components/reviews/ReportForm';
import { PageHead } from '@components/shell/PageHead';
import { LoadingState } from '@components/ui/LoadingState';
import { Screen } from '@components/ui/Screen';
import { useAuthInitializing, useAuthUser } from '@hooks/useAuthUser';

export default function ReportScreen() {
  const { reviewId } = useLocalSearchParams<{ reviewId: string }>();
  const { t } = useTranslation('reviews');
  const user = useAuthUser();
  const initializing = useAuthInitializing();

  if (initializing) return <LoadingState />;

  return (
    <>
      <PageHead title={t('report.title')} />
      {user ? (
        <ReportForm reviewId={reviewId} />
      ) : (
        <Screen width="reading">
          <AuthRequired title={t('report.authTitle')} message={t('report.authMessage')} />
        </Screen>
      )}
    </>
  );
}
