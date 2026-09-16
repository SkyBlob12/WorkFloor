import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { layout, size, spacing } from '@constants/theme';

export interface CompanyWideLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

const styles = StyleSheet.create({
  layout: { width: '100%', maxWidth: layout.contentMaxWidth, flex: 1, flexDirection: 'row', alignSelf: 'center' },
  sidebar: { width: size.sidebar },
  sidebarContent: { paddingTop: spacing.xl, paddingBottom: spacing.xl, paddingLeft: spacing.xl },
  main: { flex: 1 },
});

/** Grand écran : synthèse fixe à gauche, avis défilants à droite. */
export function CompanyWideLayout({ sidebar, children }: CompanyWideLayoutProps) {
  return (
    <View style={styles.layout}>
      <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarContent}>
        {sidebar}
      </ScrollView>
      <View style={styles.main}>{children}</View>
    </View>
  );
}

export default CompanyWideLayout;
