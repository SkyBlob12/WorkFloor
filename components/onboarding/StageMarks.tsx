import type { DimensionValue } from 'react-native';
import { View } from 'react-native';

import { radius, size, tilt } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

interface Mark {
  top: DimensionValue;
  left: DimensionValue;
  tilt: keyof typeof tilt;
}

// Répartition fixe (pourcentages de la scène) : un motif discret, jamais sous le centre.
const MARKS: readonly Mark[] = [
  { top: '4%', left: '8%', tilt: 'left' },
  { top: '10%', left: '46%', tilt: 'right' },
  { top: '2%', left: '84%', tilt: 'slightLeft' },
  { top: '30%', left: '2%', tilt: 'right' },
  { top: '38%', left: '92%', tilt: 'left' },
  { top: '64%', left: '5%', tilt: 'slightRight' },
  { top: '72%', left: '88%', tilt: 'right' },
  { top: '94%', left: '22%', tilt: 'left' },
  { top: '90%', left: '70%', tilt: 'slightLeft' },
];

const useStyles = makeStyles((palette) => ({
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  mark: {
    position: 'absolute',
    width: size.markWidth,
    height: size.markHeight,
    borderRadius: radius.full,
    backgroundColor: palette.border,
  },
}));

/** Petits traits inclinés éparpillés derrière l'illustration (décoratif). */
export function StageMarks() {
  const styles = useStyles();
  return (
    <View style={styles.layer} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {MARKS.map((mark) => (
        <View
          key={`${mark.top}-${mark.left}`}
          style={[styles.mark, { top: mark.top, left: mark.left, transform: [{ rotate: tilt[mark.tilt] }] }]}
        />
      ))}
    </View>
  );
}

export default StageMarks;
