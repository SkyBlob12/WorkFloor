import { useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ConfirmSheet } from '@components/ui/ConfirmSheet';
import { SettingsGroup } from '@components/ui/SettingsGroup';
import { SettingsRow } from '@components/ui/SettingsRow';
import { useDeleteAccount } from '@hooks/useDeleteAccount';
import { signOut } from '@services/account';

/** Déconnexion et suppression du compte (irréversible côté serveur : confirmation obligatoire). */
export function SessionSettings() {
  const { t } = useTranslation('account');
  const router = useRouter();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const deleteAccount = useDeleteAccount();

  const confirmDeletion = () =>
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        setConfirmVisible(false);
        router.replace('/');
      },
      onError: () => setConfirmVisible(false),
    });

  return (
    <>
      <SettingsGroup title={t('settings.groups.session')}>
        <SettingsRow icon="log-out" label={t('actions.signOut')} onPress={() => void signOut()} />
        <SettingsRow icon="trash-2" tone="danger" label={t('actions.delete')} onPress={() => setConfirmVisible(true)} />
      </SettingsGroup>
      <ConfirmSheet
        visible={confirmVisible}
        title={t('deleteConfirm.title')}
        message={t('deleteConfirm.message')}
        confirmLabel={t('deleteConfirm.confirm')}
        destructive
        loading={deleteAccount.isPending}
        onConfirm={confirmDeletion}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
}

export default SessionSettings;
