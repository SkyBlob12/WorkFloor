import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { FormSection } from '@components/ui/FormSection';
import { StarInput } from '@components/ui/StarInput';
import { Text } from '@components/ui/Text';
import { RATING_CRITERIA } from '@constants/reviews';
import { iconSize, spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';
import type { ReviewFormState } from '@hooks/useReviewForm';

export interface ReviewCriteriaSectionProps {
  form: ReviewFormState;
}

const styles = StyleSheet.create({
  stacked: { gap: spacing.sm },
  inline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
});

export function ReviewCriteriaSection({ form }: ReviewCriteriaSectionProps) {
  const { t } = useTranslation('reviews');
  const { isWide } = useLayout();
  return (
    <FormSection title={t('form.criteria')} description={t('form.criteriaHint')}>
      {RATING_CRITERIA.map((criterion) => {
        const label = t(`criterion.${criterion}`);
        const field = `rating_${criterion}` as const;
        return (
          <View key={criterion} style={isWide ? styles.inline : styles.stacked}>
            <Text variant="label">{label}</Text>
            <StarInput label={label} value={form.draft[field]} onChange={(value) => form.update(field, value)} optional size={iconSize.xl} />
          </View>
        );
      })}
    </FormSection>
  );
}

export default ReviewCriteriaSection;
