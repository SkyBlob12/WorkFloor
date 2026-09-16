import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { effects } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useColorSchemeName } from '@hooks/useThemeColors';

export interface GlassSurfaceProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function detectLiquidGlass(): boolean {
  try {
    return Platform.OS === 'ios' && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

const liquidGlass = detectLiquidGlass();

const useStyles = makeStyles((palette) => ({
  clip: { overflow: 'hidden' },
  outline: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.glassBorder },
  blurTint: { backgroundColor: palette.glass },
  solid: { backgroundColor: palette.glassSolid },
}));

/**
 * Matière « verre » : Liquid Glass natif sur iOS 26+, flou système sur iOS plus ancien,
 * surface translucide opaque sur Android (le flou y est coûteux et peu fiable).
 */
export function GlassSurface({ children, style }: GlassSurfaceProps) {
  const scheme = useColorSchemeName();
  const styles = useStyles();

  if (liquidGlass) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive colorScheme={scheme} style={[styles.clip, style]}>
        {children}
      </GlassView>
    );
  }
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={effects.blurIntensity}
        tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
        style={[styles.clip, styles.outline, style]}>
        {children}
      </BlurView>
    );
  }
  return <View style={[styles.clip, styles.outline, styles.solid, style]}>{children}</View>;
}

export default GlassSurface;
