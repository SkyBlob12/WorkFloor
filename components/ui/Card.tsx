import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((palette) => ({
  card: { borderRadius: radius.lg, backgroundColor: palette.surface, padding: spacing.md },
}));

/** Surface blanche arrondie sur le fond gris : pas de bordure, le contraste suffit. */
export function Card({ children, style }: CardProps) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export default Card;
