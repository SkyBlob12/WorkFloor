import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { spacing } from '@constants/theme';

import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, paddingTop: spacing.sm },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
});

/**
 * Confirmation explicite. Réservée aux actions irréversibles côté serveur (suppression du compte) :
 * pour le reste, préférer une action différée avec « Annuler » (useUndoableAction).
 */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const { t } = useTranslation('common');
  return (
    <Sheet visible={visible} onDismiss={onCancel}>
      <View style={styles.header}>
        <Text variant="heading">{title}</Text>
        <Text variant="body" tone="muted">
          {message}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} loading={loading} onPress={onConfirm} />
        <Button label={t('action.cancel')} variant="ghost" onPress={onCancel} disabled={loading} />
      </View>
    </Sheet>
  );
}

export default ConfirmSheet;
