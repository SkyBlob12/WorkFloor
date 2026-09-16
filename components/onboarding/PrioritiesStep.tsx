import { StyleSheet, View } from 'react-native';

import { Trans, useTranslation } from 'react-i18next';

import { Pill } from '@components/ui/Pill';
import { MAX_PRIORITIES, type PriorityCriterion } from '@constants/onboarding';
import { RATING_CRITERIA } from '@constants/reviews';
import { spacing } from '@constants/theme';
import type { IconName } from '@app-types/icons';

import type { CardTilt } from './FloatingCard';
import { OnboardingStage } from './OnboardingStage';
import { PriorityChip } from './PriorityChip';
import { ACCENT, StepHeadline } from './StepHeadline';

export interface PrioritiesStepProps {
  value: PriorityCriterion[];
  onToggle: (criterion: PriorityCriterion) => void;
}

const CRITERION_ICONS: Record<PriorityCriterion, IconName> = {
  culture: 'smile',
  salary: 'trending-up',
  benefits: 'gift',
  management: 'users',
  work_life: 'sun',
};

const CRITERION_TILTS: Record<PriorityCriterion, CardTilt> = {
  culture: 'left',
  salary: 'slightRight',
  benefits: 'slightLeft',
  management: 'right',
  work_life: 'slightLeft',
};

const styles = StyleSheet.create({
  cloud: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
});

export function PrioritiesStep({ value, onToggle }: PrioritiesStepProps) {
  const { t } = useTranslation(['onboarding', 'reviews']);
  const full = value.length >= MAX_PRIORITIES;
  return (
    <>
      <OnboardingStage>
        <View accessibilityLiveRegion="polite">
          <Pill tone="primary" icon="sliders" label={t('priorities.counter', { current: value.length, max: MAX_PRIORITIES })} />
        </View>
        <View style={styles.cloud}>
          {RATING_CRITERIA.map((criterion) => {
            const selected = value.includes(criterion);
            return (
              <PriorityChip
                key={criterion}
                icon={CRITERION_ICONS[criterion]}
                tilt={CRITERION_TILTS[criterion]}
                label={t(`reviews:criterion.${criterion}`)}
                selected={selected}
                disabled={full && !selected}
                onPress={() => onToggle(criterion)}
              />
            );
          })}
        </View>
      </OnboardingStage>
      <StepHeadline
        title={<Trans t={t} i18nKey="priorities.title" components={ACCENT} />}
        subtitle={t('priorities.subtitle', { count: MAX_PRIORITIES })}
      />
    </>
  );
}

export default PrioritiesStep;
