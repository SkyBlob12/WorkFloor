import { useEffect } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthForm } from '@components/auth/AuthForm';
import { PageHead } from '@components/shell/PageHead';
import { Screen } from '@components/ui/Screen';
import { useAuthUser } from '@hooks/useAuthUser';
import { useSignInForm } from '@hooks/useSignInForm';

export default function SignInScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { t } = useTranslation('account');
  const router = useRouter();
  const user = useAuthUser();
  const form = useSignInForm(mode === 'signup' ? 'signup' : 'signin');

  // Connexion réussie : retour à l'écran d'origine.
  useEffect(() => {
    if (!user) return;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [user, router]);

  return (
    <Screen width="reading">
      <PageHead title={t(`auth.title.${form.mode}`)} />
      <AuthForm form={form} />
    </Screen>
  );
}
