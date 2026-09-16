import { useTranslation } from 'react-i18next';

import { FormSection } from '@components/ui/FormSection';
import { TextField } from '@components/ui/TextField';
import { REVIEW_LIMITS } from '@constants/reviews';
import { useReviewFieldError } from '@hooks/useReviewFieldError';
import type { ReviewFormState } from '@hooks/useReviewForm';

export interface ReviewContentSectionProps {
  form: ReviewFormState;
}

export function ReviewContentSection({ form }: ReviewContentSectionProps) {
  const { t } = useTranslation('reviews');
  const fieldError = useReviewFieldError();
  const { draft, errors, update } = form;
  return (
    <FormSection title={t('form.content')}>
      <TextField
        label={t('form.title')}
        value={draft.title}
        onChangeText={(value) => update('title', value)}
        maxLength={REVIEW_LIMITS.title.max}
        placeholder={t('form.titlePlaceholder')}
        error={fieldError(errors.title)}
      />
      <TextField
        label={t('form.pros')}
        value={draft.pros}
        onChangeText={(value) => update('pros', value)}
        multiline
        maxLength={REVIEW_LIMITS.pros.max}
        placeholder={t('form.prosPlaceholder')}
        error={fieldError(errors.pros)}
      />
      <TextField
        label={t('form.cons')}
        value={draft.cons}
        onChangeText={(value) => update('cons', value)}
        multiline
        maxLength={REVIEW_LIMITS.cons.max}
        placeholder={t('form.consPlaceholder')}
        error={fieldError(errors.cons)}
      />
      <TextField
        label={t('form.benefits')}
        value={draft.benefits ?? ''}
        onChangeText={(value) => update('benefits', value || null)}
        multiline
        maxLength={REVIEW_LIMITS.benefits.max}
        placeholder={t('form.benefitsPlaceholder')}
        error={fieldError(errors.benefits)}
      />
    </FormSection>
  );
}

export default ReviewContentSection;
