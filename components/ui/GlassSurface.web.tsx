import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { effects } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';

export interface GlassSurfaceProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Propriétés CSS absentes des types React Native, prises en charge par react-native-web.
const backdrop = {
  backdropFilter: effects.webBackdrop,
  WebkitBackdropFilter: effects.webBackdrop,
} as unknown as ViewStyle;

const useStyles = makeStyles((palette) => ({
  glass: {
    overflow: 'hidden',
    backgroundColor: palette.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.glassBorder,
  },
}));

/** Web : flou d'arrière-plan CSS (backdrop-filter) sur une teinte translucide. */
export function GlassSurface({ children, style }: GlassSurfaceProps) {
  const styles = useStyles();
  return <View style={[styles.glass, backdrop, style]}>{children}</View>;
}

export default GlassSurface;
