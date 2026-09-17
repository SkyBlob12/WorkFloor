import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { Trans, useTranslation } from 'react-i18next';

import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

import { FloatingCard } from './FloatingCard';
import { OnboardingStage } from './OnboardingStage';
import { ACCENT, StepHeadline } from './StepHeadline';
import { Sticker } from './Sticker';

const POINTS = ['name', 'date', 'company'] as const;
const SAMPLE_RATING = 4;

const useStyles = makeStyles((palette) => ({
  avatar: {
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.primaryMuted,
  },
}));

const layout = StyleSheet.create({
  card: { gap: spacing.md },
  author: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
  points: { gap: spacing.xs },
  point: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

/** Avis d'exemple déjà anonymisé : ce que les lecteurs verront. */
export function AnonymityStep() {
  const { t } = useTranslation('onboarding');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <>
      <OnboardingStage>
        <FloatingCard tilt="slightLeft" style={layout.card}>
          <Sticker label={t('anonymity.sticker')} />
          <View style={layout.author}>
            <View style={styles.avatar}>
              <Feather name="eye-off" size={iconSize.lg} color={palette.primary} />
            </View>
            <Text variant="label" tone="primary" style={layout.grow}>
              {t('anonymity.sampleAnonymous')}
            </Text>
            <RatingBadge value={SAMPLE_RATING} />
          </View>
          <Text variant="heading">{t('anonymity.sampleTitle')}</Text>
          <View style={layout.points}>
            {POINTS.map((point) => (
              <View key={point} style={layout.point}>
                <Feather name="check-circle" size={iconSize.md} color={palette.success} />
                <Text variant="caption" tone="default">
                  {t(`anonymity.points.${point}`)}
                </Text>
              </View>
            ))}
          </View>
        </FloatingCard>
      </OnboardingStage>
      <StepHeadline title={<Trans t={t} i18nKey="anonymity.title" components={ACCENT} />} />
    </>
  );
}

export default AnonymityStep;
