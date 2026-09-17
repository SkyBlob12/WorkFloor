import { StyleSheet, View } from 'react-native';

import { Trans, useTranslation } from 'react-i18next';

import type { PriorityCriterion } from '@constants/onboarding';
import { RATING_CRITERIA } from '@constants/reviews';
import { spacing } from '@constants/theme';
import type { IconName } from '@app-types/icons';

import type { CardTilt } from './FloatingCard';
import { OnboardingStage } from './OnboardingStage';
import { PriorityChip } from './PriorityChip';
import { ACCENT, StepHeadline } from './StepHeadline';

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

/** Critères remplis d'encre dans l'illustration. */
const HIGHLIGHTED: readonly PriorityCriterion[] = ['salary', 'work_life'];

const styles = StyleSheet.create({
  cloud: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
});

export function PrioritiesStep() {
  const { t } = useTranslation(['onboarding', 'reviews']);
  return (
    <>
      <OnboardingStage>
        <View style={styles.cloud}>
          {RATING_CRITERIA.map((criterion) => (
            <PriorityChip
              key={criterion}
              icon={CRITERION_ICONS[criterion]}
              tilt={CRITERION_TILTS[criterion]}
              label={t(`reviews:criterion.${criterion}`)}
              highlighted={HIGHLIGHTED.includes(criterion)}
            />
          ))}
        </View>
      </OnboardingStage>
      <StepHeadline title={<Trans t={t} i18nKey="priorities.title" components={ACCENT} />} />
    </>
  );
}

export default PrioritiesStep;
