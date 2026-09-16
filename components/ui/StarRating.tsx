import { StyleSheet, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { getIntlTag } from '@/i18n/currentLocale';
import { iconSize } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';
import { formatRating } from '@utils/format';

const STEPS = [1, 2, 3, 4, 5] as const;

export interface StarRatingProps {
  value: number | null;
  size?: number;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row' } });

export function StarRating({ value, size = iconSize.md }: StarRatingProps) {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  const v = value ?? 0;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={value == null ? t('rating.notRated') : t('rating.value', { value: formatRating(value, getIntlTag()) })}>
      {STEPS.map((step) => (
        <Ionicons
          key={step}
          name={v >= step - 0.25 ? 'star' : v >= step - 0.75 ? 'star-half' : 'star-outline'}
          size={size}
          color={value == null ? palette.border : palette.rating}
        />
      ))}
    </View>
  );
}

export default StarRating;
