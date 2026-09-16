import type { ReactNode } from 'react';
import { View } from 'react-native';

import { effects, radius, size, spacing, tilt } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

import { StageMarks } from './StageMarks';

export interface OnboardingStageProps {
  children: ReactNode;
  /** Scène plus basse, quand l'étape porte beaucoup d'actions sous le titre. */
  compact?: boolean;
}

const useStyles = makeStyles((palette) => ({
  stage: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  regular: { minHeight: size.onboardingStage },
  compact: { minHeight: size.onboardingStageCompact },
  sheet: {
    position: 'absolute',
    width: size.stageCard,
    height: size.onboardingStageCompact,
    borderRadius: radius.xl,
    borderWidth: size.outline,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    boxShadow: effects.sheetShadow,
  },
  sheetLeft: { transform: [{ rotate: tilt.left }] },
  sheetRight: { transform: [{ rotate: tilt.right }] },
}));

/** Illustration du haut de chaque étape : petits traits éparpillés et feuilles posées derrière le contenu. */
export function OnboardingStage({ children, compact = false }: OnboardingStageProps) {
  const styles = useStyles();
  return (
    <View style={[styles.stage, compact ? styles.compact : styles.regular]}>
      <StageMarks />
      <View style={[styles.sheet, styles.sheetLeft]} importantForAccessibility="no" accessibilityElementsHidden />
      <View style={[styles.sheet, styles.sheetRight]} importantForAccessibility="no" accessibilityElementsHidden />
      {children}
    </View>
  );
}

export default OnboardingStage;
