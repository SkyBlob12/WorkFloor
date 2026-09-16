import { StyleSheet } from 'react-native';

import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';

import { Text } from '@components/ui/Text';
import { APP } from '@constants/app';
import { motion, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useLaunchSplash } from '@hooks/useLaunchSplash';
import { useColorSchemeName } from '@hooks/useThemeColors';
import { LOGO_MARK } from '@lib/brandAssets';

const useStyles = makeStyles((palette) => ({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: palette.background,
  },
}));

// Le logo « se pose » avec un léger rebond, puis le nom monte juste après.
// Reanimated respecte le réglage système « Réduire les animations ».
const LOGO_ENTER = ZoomIn.springify().damping(motion.splashSpringDamping).mass(motion.splashSpringMass);
const NAME_ENTER = FadeInDown.delay(motion.splashTextDelay).duration(motion.splashFade);

const layout = StyleSheet.create({
  logo: { width: size.splashLogo, height: size.splashLogo },
});

/**
 * Écran de lancement posé par l'app dès son premier rendu : fond seul tant que l'état est inconnu,
 * puis logo animé aux lancements suivants. Au premier lancement, il s'efface sur l'onboarding
 * sans jamais montrer le logo ni la page d'accueil.
 */
export function LaunchSplash() {
  const { covering, showBrand, onDrawn } = useLaunchSplash();
  const scheme = useColorSchemeName();
  const styles = useStyles();
  if (!covering) return null;
  return (
    <Animated.View
      exiting={FadeOut.duration(motion.splashFade)}
      onLayout={onDrawn}
      style={styles.screen}
      accessible
      accessibilityLabel={APP.name}>
      {showBrand ? (
        <>
          <Animated.View entering={LOGO_ENTER}>
            <Image source={LOGO_MARK[scheme]} contentFit="contain" style={layout.logo} />
          </Animated.View>
          <Animated.View entering={NAME_ENTER}>
            <Text variant="display" weight="bold">
              {APP.wordmark.start}
              <Text variant="display" tone="primary" weight="bold">
                {APP.wordmark.accent}
              </Text>
              {APP.wordmark.end}
            </Text>
          </Animated.View>
        </>
      ) : null}
    </Animated.View>
  );
}

export default LaunchSplash;
