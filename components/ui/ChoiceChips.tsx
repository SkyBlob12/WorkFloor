import { View } from 'react-native';

import { radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ChoiceOption<T> {
  value: T;
  label: string;
}

export interface ChoiceChipsProps<T extends string | boolean> {
  label: string;
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  allowDeselect?: boolean;
}

const useStyles = makeStyles((palette) => ({
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    height: size.controlSmall,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
  },
  selected: { borderColor: palette.primaryFill, backgroundColor: palette.primaryFill },
}));

export function ChoiceChips<T extends string | boolean>({
  label,
  options,
  value,
  onChange,
  allowDeselect = false,
}: ChoiceChipsProps<T>) {
  const styles = useStyles();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.group}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={String(option.value)}
            onPress={() => onChange(selected && allowDeselect ? null : option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            style={[styles.chip, selected && styles.selected]}>
            <Text variant="caption" tone={selected ? 'onPrimary' : 'default'} weight="medium">
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default ChoiceChips;
