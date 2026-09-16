import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ResetPasswordForm } from '@components/auth/ResetPasswordForm';
import { PageHead } from '@components/shell/PageHead';
import { LoadingState } from '@components/ui/LoadingState';
import { Notice } from '@components/ui/Notice';
import { Screen } from '@components/ui/Screen';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import { useAuthInitializing, useAuthSession } from '@hooks/useAuthUser';

const styles = StyleSheet.create({ stack: { gap: spacing.lg } });

/** Page d'arrivée du lien « mot de passe oublié » (session récupérée depuis l'URL par supabase-js). */
export default function ResetPasswordScreen() {
  const { t } = useTranslation('account');
  const session = useAuthSession();
  const initializing = useAuthInitializing();

  if (initializing) return <LoadingState />;

  return (
    <Screen width="reading">
      <PageHead title={t('reset.title')} headerTitle={t('reset.title')} />
      <View style={styles.stack}>
        <Text variant="display" accessibilityRole="header">
          {t('reset.title')}
        </Text>
        {session ? (
          <ResetPasswordForm />
        ) : (
          <Notice tone="warning" title={t('reset.expiredTitle')}>
            {t('reset.expiredMessage')}
          </Notice>
        )}
      </View>
    </Screen>
  );
}
