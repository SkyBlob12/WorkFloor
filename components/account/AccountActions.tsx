import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { ConfirmSheet } from '@components/ui/ConfirmSheet';
import { spacing } from '@constants/theme';
import { useDeleteAccount } from '@hooks/useDeleteAccount';
import { signOut } from '@services/account';

const styles = StyleSheet.create({ stack: { gap: spacing.sm } });

export function AccountActions() {
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
    <View style={styles.stack}>
      <Button label={t('actions.signOut')} variant="secondary" icon="log-out" onPress={() => void signOut()} />
      <Button label={t('actions.delete')} variant="danger" icon="trash-2" onPress={() => setConfirmVisible(true)} />
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
    </View>
  );
}

export default AccountActions;
