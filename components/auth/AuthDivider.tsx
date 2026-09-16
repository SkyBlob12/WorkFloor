import { StyleSheet, View } from 'react-native';

import { Divider } from '@components/ui/Divider';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';

export interface AuthDividerProps {
  label: string;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  line: { flex: 1 },
});

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <View style={styles.row}>
      <Divider style={styles.line} />
      <Text variant="caption">{label}</Text>
      <Divider style={styles.line} />
    </View>
  );
}

export default AuthDivider;
