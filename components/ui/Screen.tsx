import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useLayout } from '@hooks/useLayout';
import { useScreenContentStyle } from '@hooks/useScreenContentStyle';

import { ContentColumn } from './ContentColumn';

export interface ScreenProps {
  children: ReactNode;
  width?: 'content' | 'reading';
  /** Écran d'onglet : zone sûre du haut et espace sous la barre flottante. */
  inTabs?: boolean;
}

const useStyles = makeStyles((palette) => ({
  scroll: { flex: 1, backgroundColor: palette.background },
  narrow: { paddingTop: spacing.md },
  wide: { paddingTop: spacing.xl },
}));

/** Écran défilant simple. Pour une liste, utiliser FlatList + ContentColumn. */
export function Screen({ children, width = 'content', inTabs = false }: ScreenProps) {
  const { isWide } = useLayout();
  const styles = useStyles();
  const contentStyle = useScreenContentStyle(inTabs);
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <ContentColumn width={width} style={isWide ? styles.wide : styles.narrow}>
        {children}
      </ContentColumn>
    </ScrollView>
  );
}

export default Screen;
