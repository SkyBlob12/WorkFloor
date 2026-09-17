import { StyleSheet, View } from 'react-native';

import { Trans, useTranslation } from 'react-i18next';

import { Avatar } from '@components/ui/Avatar';
import { StarRating } from '@components/ui/StarRating';
import { Text } from '@components/ui/Text';
import { iconSize, spacing } from '@constants/theme';

import { FloatingCard } from './FloatingCard';
import { OnboardingStage } from './OnboardingStage';
import { ACCENT, StepHeadline } from './StepHeadline';

const SAMPLE_RATING = 4;

const styles = StyleSheet.create({
  card: { gap: spacing.md, paddingVertical: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1, gap: spacing.xxs },
  stars: { alignItems: 'center' },
});

export function RatingStep() {
  const { t } = useTranslation('onboarding');
  const target = t('rating.target');
  return (
    <>
      <OnboardingStage>
        <FloatingCard tilt="slightLeft" style={styles.card}>
          <View style={styles.header}>
            <Avatar name={target} />
            <View style={styles.grow}>
              <Text variant="label">{target}</Text>
              <Text variant="caption">{t('rating.overall')}</Text>
            </View>
          </View>
          <View style={styles.stars}>
            <StarRating value={SAMPLE_RATING} size={iconSize.xxl} />
          </View>
        </FloatingCard>
      </OnboardingStage>
      <StepHeadline title={<Trans t={t} i18nKey="rating.title" components={ACCENT} />} />
    </>
  );
}

export default RatingStep;
