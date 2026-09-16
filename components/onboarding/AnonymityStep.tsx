import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { Trans, useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@components/ui/Button';
import { RatingBadge } from '@components/ui/RatingBadge';
import { Text } from '@components/ui/Text';
import { iconSize, motion, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

import { FloatingCard } from './FloatingCard';
import { OnboardingStage } from './OnboardingStage';
import { ACCENT, StepHeadline } from './StepHeadline';
import { Sticker } from './Sticker';

export interface AnonymityStepProps {
  anonymized: boolean;
  onAnonymize: () => void;
}

const POINTS = ['name', 'date', 'company'] as const;
const SAMPLE_RATING = 4;

const useStyles = makeStyles((palette) => ({
  avatar: {
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.surfaceMuted,
  },
  hidden: { backgroundColor: palette.primaryMuted },
}));

const layout = StyleSheet.create({
  card: { gap: spacing.md },
  author: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
  points: { gap: spacing.xs },
  point: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

export function AnonymityStep({ anonymized, onAnonymize }: AnonymityStepProps) {
  const { t } = useTranslation('onboarding');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <>
      <OnboardingStage>
        <FloatingCard tilt={anonymized ? 'none' : 'slightLeft'} style={layout.card}>
          {anonymized ? <Sticker label={t('anonymity.sticker')} /> : null}
          <View style={layout.author}>
            <View style={[styles.avatar, anonymized && styles.hidden]}>
              <Feather name={anonymized ? 'eye-off' : 'user'} size={iconSize.lg} color={anonymized ? palette.primary : palette.text} />
            </View>
            <Animated.View key={anonymized ? 'anonymous' : 'named'} entering={FadeIn.duration(motion.stepDuration)} style={layout.grow}>
              <Text variant="label" tone={anonymized ? 'primary' : 'default'}>
                {anonymized ? t('anonymity.sampleAnonymous') : t('anonymity.sampleAuthor')}
              </Text>
            </Animated.View>
            <RatingBadge value={SAMPLE_RATING} />
          </View>
          <Text variant="heading">{t('anonymity.sampleTitle')}</Text>
          {anonymized ? (
            <Animated.View entering={FadeIn.duration(motion.stepDuration)} style={layout.points}>
              {POINTS.map((point) => (
                <View key={point} style={layout.point}>
                  <Feather name="check-circle" size={iconSize.md} color={palette.success} />
                  <Text variant="caption" tone="default">
                    {t(`anonymity.points.${point}`)}
                  </Text>
                </View>
              ))}
            </Animated.View>
          ) : (
            <Button icon="eye-off" label={t('anonymity.action')} onPress={onAnonymize} />
          )}
        </FloatingCard>
      </OnboardingStage>
      <StepHeadline title={<Trans t={t} i18nKey="anonymity.title" components={ACCENT} />} subtitle={t('anonymity.subtitle')} />
    </>
  );
}

export default AnonymityStep;
