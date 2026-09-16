import { StyleSheet, View } from 'react-native';

import { spacing } from '@constants/theme';

const styles = StyleSheet.create({ separator: { height: spacing.sm } });

/** Espace entre deux cartes d'une liste. */
export function ListSeparator() {
  return <View style={styles.separator} />;
}

export default ListSeparator;
