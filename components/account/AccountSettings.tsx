import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

import { SettingsGroup } from '@components/ui/SettingsGroup';
import { SettingsRow } from '@components/ui/SettingsRow';
import { useBlockedAuthorsCount, useUnblockAllAuthors } from '@hooks/useBlockedAuthors';
import { usePasswordChangeLink } from '@hooks/usePasswordChangeLink';
import { showSuccessToast } from '@lib/toast';
import { authProviderOf } from '@utils/profile';

export interface AccountSettingsProps {
  user: User;
}

/** Réglages liés au compte : mot de passe (comptes email) et auteurs masqués. */
export function AccountSettings({ user }: AccountSettingsProps) {
  const { t } = useTranslation('account');
  const { data: blockedCount = 0 } = useBlockedAuthorsCount();
  const unblock = useUnblockAllAuthors();
  const passwordLink = usePasswordChangeLink();
  const email = user.email ?? '';

  const sendPasswordLink = () =>
    passwordLink.mutate(undefined, { onSuccess: () => showSuccessToast(t('settings.password.sent', { email })) });

  return (
    <SettingsGroup title={t('settings.groups.account')}>
      {authProviderOf(user.app_metadata) === 'email' && email ? (
        <SettingsRow
          icon="key"
          label={t('settings.password.label')}
          description={t('settings.password.description')}
          loading={passwordLink.isPending}
          onPress={sendPasswordLink}
        />
      ) : null}
      <SettingsRow
        icon="eye-off"
        label={t('blocked.title')}
        description={blockedCount > 0 ? t('blocked.count', { count: blockedCount }) : t('blocked.none')}
        value={blockedCount > 0 ? t('blocked.unblockAll') : undefined}
        accessibilityLabel={t('blocked.unblockAll')}
        loading={unblock.isPending}
        onPress={blockedCount > 0 ? () => unblock.mutate() : undefined}
      />
    </SettingsGroup>
  );
}

export default AccountSettings;
