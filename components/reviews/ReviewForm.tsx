import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { PageHead } from '@components/shell/PageHead';
import { Notice } from '@components/ui/Notice';
import { Screen } from '@components/ui/Screen';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import { useErrorMessage } from '@hooks/useErrorMessage';
import { useReviewForm, type ReviewFormError } from '@hooks/useReviewForm';
import type { Company, OwnReview } from '@app-types/domain';

import { ReviewContentSection } from './ReviewContentSection';
import { ReviewCriteriaSection } from './ReviewCriteriaSection';
import { ReviewOverallSection } from './ReviewOverallSection';
import { ReviewPositionSection } from './ReviewPositionSection';
import { ReviewSalarySection } from './ReviewSalarySection';
import { ReviewSubmitFooter } from './ReviewSubmitFooter';
import { ReviewSubmitted } from './ReviewSubmitted';

export interface ReviewFormProps {
  company: Company;
  initialReview: OwnReview | null;
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  header: { gap: spacing.xxs },
});

export function ReviewForm({ company, initialReview }: ReviewFormProps) {
  const { t } = useTranslation('reviews');
  const errorMessage = useErrorMessage();
  const form = useReviewForm({ companyId: company.id, initialReview });

  if (form.result) {
    return <ReviewSubmitted status={form.result} isEdit={form.isEdit} companyId={company.id} />;
  }

  const title = form.isEdit ? t('form.titleEdit') : t('form.titleNew');
  const describeError = (error: ReviewFormError) =>
    error.type === 'validation' ? t('form.fixErrors') : errorMessage(error.error);

  return (
    <Screen width="reading">
      <PageHead title={`${title} · ${company.name}`} headerTitle={title} />
      <View style={styles.form}>
        <View style={styles.header}>
          <Text variant="label" tone="primary">
            {company.name}
          </Text>
          <Text variant="display" accessibilityRole="header">
            {title}
          </Text>
        </View>
        <Notice title={t('form.charterTitle')}>{t('form.charterMessage')}</Notice>
        <ReviewOverallSection form={form} />
        <ReviewPositionSection form={form} />
        <ReviewContentSection form={form} />
        <ReviewCriteriaSection form={form} />
        <ReviewSalarySection form={form} />
        <ReviewSubmitFooter form={form} errorText={form.formError ? describeError(form.formError) : null} />
      </View>
    </Screen>
  );
}

export default ReviewForm;
