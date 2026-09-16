import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { typography, type ColorName, type TypographyVariant } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';

export type TextVariant = TypographyVariant;
export type TextTone = 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning' | 'onPrimary' | 'onInk' | 'inverse';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

const toneColor: Record<TextTone, ColorName> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  onPrimary: 'onPrimary',
  onInk: 'onInk',
  inverse: 'background',
};

const weights: Record<TextWeight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: TextWeight;
  align?: TextStyle['textAlign'];
}

/** Texte en police système : la hiérarchie passe par la taille et la graisse (tokens). */
export function Text({ variant = 'body', tone, weight, align, style, ...props }: TextProps) {
  const palette = useThemeColors();
  const resolvedTone = tone ?? (variant === 'caption' || variant === 'tiny' ? 'muted' : 'default');
  return (
    <RNText
      style={[
        typography[variant],
        { color: palette[toneColor[resolvedTone]] },
        weight ? { fontWeight: weights[weight] } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...props}
    />
  );
}

export default Text;
