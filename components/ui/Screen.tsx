import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useKeyboardAwareScroll } from '@hooks/useKeyboardAwareScroll';
import { KeyboardRevealContext } from '@hooks/useKeyboardReveal';
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

/** Écran défilant simple, qui garde le champ actif centré au-dessus du clavier. Pour une liste, utiliser FlatList + ContentColumn. */
export function Screen({ children, width = 'content', inTabs = false }: ScreenProps) {
  const { isWide } = useLayout();
  const styles = useStyles();
  const contentStyle = useScreenContentStyle(inTabs);
  const { scrollRef, bottomInset, onScroll, reveal } = useKeyboardAwareScroll();
  const keyboardStyle = bottomInset > 0 ? { paddingBottom: Number(contentStyle.paddingBottom) + bottomInset } : null;
  return (
    <KeyboardRevealContext.Provider value={reveal}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[contentStyle, keyboardStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <ContentColumn width={width} style={isWide ? styles.wide : styles.narrow}>
          {children}
        </ContentColumn>
      </ScrollView>
    </KeyboardRevealContext.Provider>
  );
}

export default Screen;
