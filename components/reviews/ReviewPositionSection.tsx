import { useTranslation } from 'react-i18next';

import { ChoiceChips } from '@components/ui/ChoiceChips';
import { FormSection } from '@components/ui/FormSection';
import { TextField } from '@components/ui/TextField';
import { CONTRACT_TYPES, EMPLOYMENT_STATUSES, REVIEW_LIMITS } from '@constants/reviews';
import { useReviewFieldError } from '@hooks/useReviewFieldError';
import type { ReviewFormState } from '@hooks/useReviewForm';
import type { ContractType, EmploymentStatus } from '@app-types/domain';

export interface ReviewPositionSectionProps {
  form: ReviewFormState;
}

export function ReviewPositionSection({ form }: ReviewPositionSectionProps) {
  const { t } = useTranslation('reviews');
  const fieldError = useReviewFieldError();
  return (
    <FormSection title={t('form.position')}>
      <ChoiceChips<EmploymentStatus>
        label={t('form.statusLabel')}
        value={form.draft.employment_status}
        onChange={(value) => value && form.update('employment_status', value)}
        options={EMPLOYMENT_STATUSES.map((value) => ({ value, label: t(`employmentStatus.${value}`) }))}
      />
      <ChoiceChips<ContractType>
        label={t('form.contractLabel')}
        value={form.draft.contract_type}
        onChange={(value) => form.update('contract_type', value)}
        allowDeselect
        options={CONTRACT_TYPES.map((value) => ({ value, label: t(`contractType.${value}`) }))}
      />
      <TextField
        label={t('form.jobTitle')}
        value={form.draft.job_title ?? ''}
        onChangeText={(value) => form.update('job_title', value || null)}
        maxLength={REVIEW_LIMITS.job_title.max}
        error={fieldError(form.errors.job_title)}
        hint={t('form.jobTitleHint')}
      />
    </FormSection>
  );
}

export default ReviewPositionSection;
