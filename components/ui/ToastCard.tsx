import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { iconSize, layout, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ToastCardProps {
  message: string;
  tone: 'error' | 'success' | 'neutral';
  action?: { label: string; onPress: () => void };
}

const useStyles = makeStyles((palette) => ({
  wrapper: { width: '100%', maxWidth: layout.sheetMaxWidth, paddingHorizontal: spacing.md },
  card: {
    minHeight: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: palette.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  message: { flex: 1 },
  action: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
}));

/** Snackbar inversée (texte clair sur fond sombre, et l'inverse en mode sombre). */
export function ToastCard({ message, tone, action }: ToastCardProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  const icon = tone === 'error' ? 'alert-circle' : tone === 'success' ? 'check-circle' : null;
  return (
    <View style={styles.wrapper}>
      <View accessibilityRole="alert" style={styles.card}>
        {icon ? <Feather name={icon} size={iconSize.md} color={palette.background} /> : null}
        <Text variant="label" tone="inverse" weight="medium" style={styles.message}>
          {message}
        </Text>
        {action ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            hitSlop={spacing.sm}
            style={styles.action}>
            <Text variant="label" tone="inverse" weight="bold">
              {action.label}
            </Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

export default ToastCard;
