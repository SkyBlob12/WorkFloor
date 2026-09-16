import { View } from 'react-native';

import { radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const useStyles = makeStyles((palette) => ({
  track: { flexDirection: 'row', borderRadius: radius.md, backgroundColor: palette.surfaceMuted, padding: spacing.xxs },
  segment: {
    flex: 1,
    height: size.controlSmall,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  selected: { backgroundColor: palette.surface },
}));

/** Choix exclusif entre 2 ou 3 options courtes (tri, langue, mode de connexion). */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  const styles = useStyles();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.selected]}>
            <Text variant="caption" tone={selected ? 'default' : 'muted'} weight="semibold" numberOfLines={1}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default SegmentedControl;
