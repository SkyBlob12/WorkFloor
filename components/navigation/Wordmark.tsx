import { StyleSheet, View } from 'react-native';

import { Image } from 'expo-image';

import { Text } from '@components/ui/Text';
import { APP } from '@constants/app';
import { size, spacing } from '@constants/theme';
import { useColorSchemeName } from '@hooks/useThemeColors';
import { LOGO_MARK } from '@lib/brandAssets';

export interface WordmarkProps {
  large?: boolean;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  small: { width: size.controlSmall, height: size.controlSmall },
  large: { width: size.avatarLarge, height: size.avatarLarge },
});

/** Logotype : logo de l'app + nom. Décoratif (le parent porte le libellé). */
export function Wordmark({ large = false }: WordmarkProps) {
  const scheme = useColorSchemeName();
  const variant = large ? 'title' : 'heading';
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Image source={LOGO_MARK[scheme]} contentFit="contain" style={large ? styles.large : styles.small} />
      <Text variant={variant} weight="bold">
        {APP.wordmark.start}
        <Text variant={variant} tone="primary" weight="bold">
          {APP.wordmark.accent}
        </Text>
        {APP.wordmark.end}
      </Text>
    </View>
  );
}

export default Wordmark;
