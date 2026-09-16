import { StyleSheet, View } from 'react-native';

import type { TabListProps } from 'expo-router/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@components/ui/GlassSurface';
import { effects, radius, size, spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';
import { tabBarBottomOffset } from '@hooks/useTabBarInset';

export type BottomTabBarProps = TabListProps;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    pointerEvents: 'box-none',
  },
  shadow: { width: '100%', maxWidth: size.tabBarMaxWidth, borderRadius: radius.full, boxShadow: effects.floatingShadow },
  island: { height: size.tabBar, borderRadius: radius.full },
  row: { flex: 1, flexDirection: 'row', alignItems: 'stretch', padding: spacing.xs },
  hidden: { display: 'none' },
});

/**
 * Îlot flottant en verre, centré au-dessus du contenu (mobile). Sur grand écran, la navigation
 * passe dans la TopBar : la liste reste montée (elle déclare les onglets) mais n'est pas affichée.
 */
export function BottomTabBar({ children, ...props }: BottomTabBarProps) {
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();

  if (isWide) {
    return (
      <View {...props} style={styles.hidden}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { bottom: tabBarBottomOffset(insets.bottom) }]}>
      <View style={styles.shadow}>
        <GlassSurface style={styles.island}>
          <View {...props} style={styles.row}>
            {children}
          </View>
        </GlassSurface>
      </View>
    </View>
  );
}

export default BottomTabBar;
