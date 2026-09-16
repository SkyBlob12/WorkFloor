import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles } from '@hooks/makeStyles';

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

const useStyles = makeStyles((palette) => ({
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
}));

export function Divider({ style }: DividerProps) {
  const styles = useStyles();
  return <View style={[styles.divider, style]} />;
}

export default Divider;
