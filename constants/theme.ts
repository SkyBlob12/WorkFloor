import type { TextStyle } from 'react-native';

import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import tokens from './tokens.json';

/**
 * Direction artistique : moderne, sobre, native.
 * Police système, fond papier crème et cartes blanches, encre presque noire pour les actions
 * principales (pilules), un terracotta comme unique accent, l'ambre réservé aux étoiles,
 * navigation flottante en verre.
 *
 * Toutes les valeurs viennent de tokens.json. Les styles se déclarent avec `makeStyles`
 * (hooks/makeStyles.ts), jamais avec des valeurs en dur.
 */
export type ColorScheme = 'light' | 'dark';
export type ColorName = keyof typeof tokens.palette.light;
export type Palette = Record<ColorName, string>;
export type TypographyVariant = keyof typeof tokens.typography;

interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
  letterSpacing?: number;
}

export const colors: Record<ColorScheme, Palette> = tokens.palette;
export const spacing = tokens.spacing;
export const radius = tokens.radius;
export const size = tokens.size;
export const iconSize = tokens.iconSize;
export const layout = tokens.layout;
export const motion = tokens.motion;
export const effects = tokens.effects;
/** Inclinaisons des éléments « posés » des illustrations (onboarding). */
export const tilt = tokens.tilt;

export const typography = Object.fromEntries(
  Object.entries(tokens.typography).map(([name, token]: [string, TypographyToken]) => [
    name,
    {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.fontWeight as TextStyle['fontWeight'],
      ...(token.letterSpacing ? { letterSpacing: token.letterSpacing } : {}),
    },
  ]),
) as Record<TypographyVariant, TextStyle>;

export const breakpoints = {
  wide: tokens.layout.breakpointWide,
  desktop: tokens.layout.breakpointDesktop,
} as const;

function toNavigationTheme(scheme: ColorScheme): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const palette = colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      border: palette.border,
    },
  };
}

export const navigationThemes: Record<ColorScheme, Theme> = {
  light: toNavigationTheme('light'),
  dark: toNavigationTheme('dark'),
};
