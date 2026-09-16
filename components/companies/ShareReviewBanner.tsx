import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing, tilt } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IconName } from '@app-types/icons';

const BADGES: readonly { icon: IconName; tilt: keyof typeof tilt }[] = [
  { icon: 'edit-3', tilt: 'left' },
  { icon: 'eye-off', tilt: 'right' },
];

const useStyles = makeStyles((palette) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.primaryMuted,
    padding: spacing.md,
  },
  badge: {
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: palette.surface,
  },
}));

const layout = StyleSheet.create({
  badges: { gap: spacing.xs },
  body: { flex: 1, alignItems: 'flex-start', gap: spacing.sm },
  text: { gap: spacing.xxs },
});

/** Encart d'incitation de l'accueil : invite à publier un avis depuis la page de découverte. */
export function ShareReviewBanner() {
  const { t } = useTranslation('companies');
  const router = useRouter();
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.banner}>
      <View style={layout.badges} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {BADGES.map((badge) => (
          <View key={badge.icon} style={[styles.badge, { transform: [{ rotate: tilt[badge.tilt] }] }]}>
            <Feather name={badge.icon} size={iconSize.lg} color={palette.primary} />
          </View>
        ))}
      </View>
      <View style={layout.body}>
        <View style={layout.text}>
          <Text variant="heading" accessibilityRole="header">
            {t('home.share.title')}
          </Text>
          <Text variant="caption" tone="default">
            {t('home.share.body')}
          </Text>
        </View>
        <Button size="sm" label={t('home.share.action')} icon="edit-3" onPress={() => router.push('/add')} />
      </View>
    </View>
  );
}

export default ShareReviewBanner;
