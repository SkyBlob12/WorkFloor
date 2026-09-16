import { StyleSheet, View } from 'react-native';

import { Text } from '@components/ui/Text';
import { radius, size, spacing, tilt } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

export interface StickerProps {
  label: string;
}

const useStyles = makeStyles((palette) => ({
  sticker: {
    height: size.sticker,
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.primaryFill,
    paddingHorizontal: spacing.md,
    transform: [{ rotate: tilt.right }],
  },
}));

const layout = StyleSheet.create({
  anchor: { position: 'absolute', top: -spacing.sm, right: -spacing.xs },
});

/** Étiquette inclinée collée dans le coin d'une carte flottante. */
export function Sticker({ label }: StickerProps) {
  const styles = useStyles();
  return (
    <View style={[layout.anchor, styles.sticker]}>
      <Text variant="caption" tone="onPrimary" weight="bold">
        {label}
      </Text>
    </View>
  );
}

export default Sticker;
