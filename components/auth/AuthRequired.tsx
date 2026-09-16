import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Notice } from '@components/ui/Notice';

export interface AuthRequiredProps {
  title: string;
  message: string;
}

export function AuthRequired({ title, message }: AuthRequiredProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  return (
    <Notice
      title={title}
      action={<Button size="sm" label={t('action.signIn')} icon="log-in" onPress={() => router.push('/sign-in')} />}>
      {message}
    </Notice>
  );
}

export default AuthRequired;
