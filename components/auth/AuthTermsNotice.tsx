import { Trans, useTranslation } from 'react-i18next';

import { LinkText } from '@components/ui/LinkText';
import { Text } from '@components/ui/Text';
import { MIN_USER_AGE } from '@constants/auth';

/**
 * Acceptation des CGU à l'inscription (exigence Apple UGC) : valable pour tous les modes
 * de connexion, y compris Google et Apple qui créent le compte au premier passage.
 */
export function AuthTermsNotice() {
  const { t } = useTranslation('account');
  return (
    <Text variant="caption" align="center">
      <Trans
        t={t}
        i18nKey="auth.terms"
        values={{ age: MIN_USER_AGE }}
        components={{ terms: <LinkText href="/legal/terms" />, privacy: <LinkText href="/legal/privacy" /> }}
      />
    </Text>
  );
}

export default AuthTermsNotice;
