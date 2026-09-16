import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

export interface OnboardingProgressProps {
  /** Index de l'étape courante, à partir de 0. */
  current: number;
  total: number;
}

const useStyles = makeStyles((palette) => ({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  dot: { width: size.dot, height: size.dot, borderRadius: radius.full, backgroundColor: palette.border },
  current: { width: size.dotActive, backgroundColor: palette.ink },
}));

/** Points de pagination : l'étape courante s'allonge. */
export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const { t } = useTranslation('onboarding');
  const styles = useStyles();
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={t('progress', { current: current + 1, total })}
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}>
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={[styles.dot, index === current && styles.current]} />
      ))}
    </View>
  );
}

export default OnboardingProgress;
