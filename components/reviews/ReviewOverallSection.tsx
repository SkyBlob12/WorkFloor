import { useTranslation } from 'react-i18next';

import { ChoiceChips } from '@components/ui/ChoiceChips';
import { FormSection } from '@components/ui/FormSection';
import { StarInput } from '@components/ui/StarInput';
import { useReviewFieldError } from '@hooks/useReviewFieldError';
import type { ReviewFormState } from '@hooks/useReviewForm';

export interface ReviewOverallSectionProps {
  form: ReviewFormState;
}

export function ReviewOverallSection({ form }: ReviewOverallSectionProps) {
  const { t } = useTranslation('reviews');
  const fieldError = useReviewFieldError();
  return (
    <>
      <FormSection title={t('form.overall')}>
        <StarInput
          label={t('form.overall')}
          value={form.draft.rating_overall || null}
          onChange={(value) => form.update('rating_overall', value ?? 0)}
          error={fieldError(form.errors.rating_overall)}
        />
      </FormSection>
      <FormSection title={t('form.recommendQuestion')}>
        <ChoiceChips<boolean>
          label={t('form.recommendLabel')}
          value={form.draft.recommends}
          onChange={(value) => form.update('recommends', value)}
          allowDeselect
          options={[
            { value: true, label: t('form.yes') },
            { value: false, label: t('form.no') },
          ]}
        />
      </FormSection>
    </>
  );
}

export default ReviewOverallSection;
