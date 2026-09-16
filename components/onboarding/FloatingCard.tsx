import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { effects, radius, size, spacing, tilt } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

export type CardTilt = keyof typeof tilt | 'none';

export interface FloatingCardProps {
  children: ReactNode;
  tilt?: CardTilt;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((palette) => ({
  card: {
    width: '100%',
    maxWidth: size.stageCard,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderWidth: size.outline,
    borderColor: palette.outline,
    boxShadow: effects.cardShadow,
  },
}));

export function tiltStyle(value: CardTilt): ViewStyle | null {
  return value === 'none' ? null : { transform: [{ rotate: tilt[value] }] };
}

/** Carte blanche « posée » sur la scène, légèrement inclinée. */
export function FloatingCard({ children, tilt: cardTilt = 'none', style }: FloatingCardProps) {
  const styles = useStyles();
  return <View style={[styles.card, tiltStyle(cardTilt), style]}>{children}</View>;
}

export default FloatingCard;
