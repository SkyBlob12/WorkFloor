import { StyleSheet, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { iconSize, spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

const STEPS = [1, 2, 3, 4, 5] as const;

export interface StarInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** Autorise à retirer la note en retouchant l'étoile sélectionnée. */
  optional?: boolean;
  size?: number;
  error?: string;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  stars: { flexDirection: 'row', gap: spacing.xs },
});

export function StarInput({ label, value, onChange, optional = false, size = iconSize.xxl, error }: StarInputProps) {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  return (
    <View style={styles.container}>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.stars}>
        {STEPS.map((step) => {
          const filled = value != null && value >= step;
          return (
            <PressableScale
              key={step}
              hitSlop={spacing.xs}
              onPress={() => onChange(optional && value === step ? null : step)}
              accessibilityRole="radio"
              accessibilityState={{ checked: value === step }}
              accessibilityLabel={t('rating.step', { label, value: step })}>
              <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={filled ? palette.rating : palette.textMuted} />
            </PressableScale>
          );
        })}
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default StarInput;
