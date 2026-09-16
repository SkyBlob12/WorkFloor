import { View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import type { TabTriggerSlotProps } from 'expo-router/ui';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { iconSize, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IoniconName } from '@app-types/icons';

export interface TabButtonProps extends TabTriggerSlotProps {
  /** Icône pleine quand l'onglet est actif, contour sinon. */
  icon: { active: IoniconName; inactive: IoniconName };
  label: string;
}

const useStyles = makeStyles((palette) => ({
  slot: { flex: 1 },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs, borderRadius: radius.full },
  active: { backgroundColor: palette.primaryMuted },
}));

export function TabButton({ icon, label, isFocused, onPress, onLongPress }: TabButtonProps) {
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.slot}>
      <PressableScale
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: isFocused }}
        style={[styles.button, isFocused && styles.active]}>
        <Ionicons
          name={isFocused ? icon.active : icon.inactive}
          size={iconSize.lg}
          color={isFocused ? palette.primary : palette.textMuted}
        />
        <Text variant="tiny" tone={isFocused ? 'primary' : 'muted'} numberOfLines={1}>
          {label}
        </Text>
      </PressableScale>
    </View>
  );
}

export default TabButton;
