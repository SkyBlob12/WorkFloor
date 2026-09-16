import { StyleSheet } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { iconSize, radius, size, spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

import { Button } from './Button';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface ActionSheetItem {
  key: string;
  label: string;
  icon: IconName;
  destructive?: boolean;
  onPress: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  title?: string;
  actions: ActionSheetItem[];
  onDismiss: () => void;
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
  row: {
    height: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  cancel: { marginTop: spacing.md },
});

export function ActionSheet({ visible, title, actions, onDismiss }: ActionSheetProps) {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  return (
    <Sheet visible={visible} onDismiss={onDismiss}>
      {title ? (
        <Text variant="caption" style={styles.title}>
          {title}
        </Text>
      ) : null}
      {actions.map((action) => (
        <PressableScale
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={() => {
            onDismiss();
            action.onPress();
          }}
          style={styles.row}>
          <Feather name={action.icon} size={iconSize.md} color={action.destructive ? palette.danger : palette.text} />
          <Text variant="label" tone={action.destructive ? 'danger' : 'default'}>
            {action.label}
          </Text>
        </PressableScale>
      ))}
      <Button label={t('action.cancel')} variant="secondary" onPress={onDismiss} style={styles.cancel} />
    </Sheet>
  );
}

export default ActionSheet;
