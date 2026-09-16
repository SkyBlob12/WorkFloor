import { StyleSheet, View } from 'react-native';

import { Trans, useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Avatar } from '@components/ui/Avatar';
import { StarInput } from '@components/ui/StarInput';
import { Text } from '@components/ui/Text';
import type { UserProfile } from '@constants/onboarding';
import { iconSize, motion, spacing } from '@constants/theme';
import { ratingFeedback } from '@utils/onboarding';

import { FloatingCard } from './FloatingCard';
import { OnboardingStage } from './OnboardingStage';
import { ACCENT, StepHeadline } from './StepHeadline';
import { Sticker } from './Sticker';

export interface RatingStepProps {
  profile: UserProfile | null;
  value: number | null;
  onChange: (rating: number | null) => void;
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, paddingVertical: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1, gap: spacing.xxs },
  stars: { alignItems: 'center' },
  feedback: { minHeight: iconSize.hero, justifyContent: 'center' },
});

export function RatingStep({ profile, value, onChange }: RatingStepProps) {
  const { t } = useTranslation('onboarding');
  const target = t(`rating.target.${profile ?? 'curious'}`);
  return (
    <>
      <OnboardingStage>
        <FloatingCard style={styles.card}>
          <Sticker label={t('rating.sticker')} />
          <View style={styles.header}>
            <Avatar name={target} />
            <View style={styles.grow}>
              <Text variant="label">{target}</Text>
              <Text variant="caption">{t('rating.overall')}</Text>
            </View>
          </View>
          <View style={styles.stars}>
            <StarInput label={t('rating.label')} value={value} onChange={onChange} size={iconSize.xxl} />
          </View>
          <View style={styles.feedback}>
            {value !== null ? (
              <Animated.View key={ratingFeedback(value)} entering={FadeIn.duration(motion.stepDuration)}>
                <Text variant="caption" tone="primary" weight="semibold" align="center" accessibilityLiveRegion="polite">
                  {t(`rating.feedback.${ratingFeedback(value)}`)}
                </Text>
              </Animated.View>
            ) : null}
          </View>
        </FloatingCard>
      </OnboardingStage>
      <StepHeadline
        title={<Trans t={t} i18nKey={`rating.title.${profile ?? 'curious'}`} components={ACCENT} />}
        subtitle={t('rating.subtitle')}
      />
    </>
  );
}

export default RatingStep;
