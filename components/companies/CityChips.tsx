import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { Facet } from '@utils/companyDirectory';

export interface CityChipsProps {
  cities: Facet<string>[];
  selected: string | null;
  onSelect: (city: string) => void;
}

const useStyles = makeStyles((palette) => ({
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    height: size.controlSmall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
  },
  selected: { backgroundColor: palette.primaryFill },
}));

export function CityChips({ cities, selected, onSelect }: CityChipsProps) {
  const { t } = useTranslation('companies');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.group}>
      {cities.map(({ value, count }) => {
        const active = value === selected;
        return (
          <PressableScale
            key={value}
            onPress={() => onSelect(value)}
            accessibilityRole="button"
            accessibilityLabel={t('home.filterCity', { label: value })}
            accessibilityState={{ selected: active }}
            style={[styles.chip, active && styles.selected]}>
            <Feather name="map-pin" size={iconSize.xs} color={active ? palette.onPrimary : palette.primary} />
            <Text variant="caption" tone={active ? 'onPrimary' : 'default'} weight="semibold">
              {value}
            </Text>
            <Text variant="caption" tone={active ? 'onPrimary' : 'muted'}>
              {count}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default CityChips;
