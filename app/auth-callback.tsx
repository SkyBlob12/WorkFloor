import { useEffect } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PageHead } from '@components/shell/PageHead';
import { LoadingState } from '@components/ui/LoadingState';
import { useAuthInitializing, useAuthUser } from '@hooks/useAuthUser';

/**
 * Retour de Google / Apple. Web : supabase-js lit la session dans l'URL.
 * Mobile : la session est enregistrée par services/oauth.ts, cet écran ne fait que rediriger.
 */
export default function AuthCallbackScreen() {
  const { t } = useTranslation('account');
  const router = useRouter();
  const user = useAuthUser();
  const initializing = useAuthInitializing();

  useEffect(() => {
    if (initializing) return;
    router.replace(user ? '/account' : '/sign-in');
  }, [initializing, user, router]);

  return (
    <>
      <PageHead title={t('auth.title.signin')} />
      <LoadingState />
    </>
  );
}
