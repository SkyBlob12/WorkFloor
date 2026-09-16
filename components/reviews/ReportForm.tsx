import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Notice } from '@components/ui/Notice';
import { Screen } from '@components/ui/Screen';
import { Text } from '@components/ui/Text';
import { TextField } from '@components/ui/TextField';
import { APP } from '@constants/app';
import { REPORT_DETAILS_MAX } from '@constants/reviews';
import { spacing } from '@constants/theme';
import { useErrorMessage } from '@hooks/useErrorMessage';
import { useReportForm } from '@hooks/useReportForm';

import { ReportDone } from './ReportDone';
import { ReportReasonList } from './ReportReasonList';

export interface ReportFormProps {
  reviewId: string;
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  header: { gap: spacing.sm },
});

export function ReportForm({ reviewId }: ReportFormProps) {
  const { t } = useTranslation('reviews');
  const errorMessage = useErrorMessage();
  const form = useReportForm(reviewId);

  if (form.done) return <ReportDone form={form} />;

  const issueText = form.issue ? t(`report.${form.issue}`) : form.serviceError ? errorMessage(form.serviceError) : null;

  return (
    <Screen width="reading">
      <View style={styles.form}>
        <View style={styles.header}>
          <Text variant="display" accessibilityRole="header">
            {t('report.title')}
          </Text>
          <Text variant="body" tone="muted">
            {t('report.intro')}
          </Text>
        </View>
        <ReportReasonList value={form.reason} onChange={form.setReason} />
        <TextField
          label={t('report.details')}
          value={form.details}
          onChangeText={form.setDetails}
          multiline
          maxLength={REPORT_DETAILS_MAX}
          placeholder={t('report.detailsPlaceholder')}
        />
        {issueText ? <Notice tone="danger">{issueText}</Notice> : null}
        <Button label={t('report.submit')} icon="flag" loading={form.submitting} onPress={form.submit} />
        <Text variant="caption">{t('report.legalNotice', { email: APP.abuseEmail })}</Text>
      </View>
    </Screen>
  );
}

export default ReportForm;
