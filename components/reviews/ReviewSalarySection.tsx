import { useTranslation } from 'react-i18next';

import { ChoiceChips } from '@components/ui/ChoiceChips';
import { FormSection } from '@components/ui/FormSection';
import { Text } from '@components/ui/Text';
import { TextField } from '@components/ui/TextField';
import { SALARY_PERIODS } from '@constants/reviews';
import { useReviewFieldError } from '@hooks/useReviewFieldError';
import type { ReviewFormState } from '@hooks/useReviewForm';
import type { SalaryPeriod } from '@app-types/domain';

export interface ReviewSalarySectionProps {
  form: ReviewFormState;
}

export function ReviewSalarySection({ form }: ReviewSalarySectionProps) {
  const { t } = useTranslation('reviews');
  const fieldError = useReviewFieldError();
  const periodError = fieldError(form.errors.salary_period);
  return (
    <FormSection title={t('form.salary')} description={t('form.salaryHint')}>
      <TextField
        label={t('form.salaryAmount')}
        value={form.salaryText}
        onChangeText={form.setSalaryText}
        keyboardType="numeric"
        placeholder={t('form.salaryPlaceholder')}
        error={fieldError(form.errors.salary_amount)}
      />
      <ChoiceChips<SalaryPeriod>
        label={t('form.salaryPeriodLabel')}
        value={form.draft.salary_period}
        onChange={(value) => form.update('salary_period', value)}
        options={SALARY_PERIODS.map((value) => ({ value, label: t(`salaryPeriod.${value}`) }))}
      />
      {periodError ? (
        <Text variant="caption" tone="danger">
          {periodError}
        </Text>
      ) : null}
    </FormSection>
  );
}

export default ReviewSalarySection;
