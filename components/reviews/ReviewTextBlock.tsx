import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';

import { Text } from '@components/ui/Text';
import { iconSize, spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

export interface ReviewTextBlockProps {
  label: string;
  text: string;
  icon: IconName;
  tone: 'success' | 'danger' | 'primary';
}

const styles = StyleSheet.create({
  block: { gap: spacing.xxs },
  label: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export function ReviewTextBlock({ label, text, icon, tone }: ReviewTextBlockProps) {
  const palette = useThemeColors();
  return (
    <View style={styles.block}>
      <View style={styles.label}>
        <Feather name={icon} size={iconSize.sm} color={palette[tone]} />
        <Text variant="label" tone={tone}>
          {label}
        </Text>
      </View>
      <Text variant="body">{text}</Text>
    </View>
  );
}

export default ReviewTextBlock;
