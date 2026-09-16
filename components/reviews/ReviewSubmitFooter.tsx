import { StyleSheet, View } from 'react-native';

import { Trans, useTranslation } from 'react-i18next';

import { Turnstile } from '@components/security/Turnstile';
import { Button } from '@components/ui/Button';
import { LinkText } from '@components/ui/LinkText';
import { Notice } from '@components/ui/Notice';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import type { ReviewFormState } from '@hooks/useReviewForm';

export interface ReviewSubmitFooterProps {
  form: ReviewFormState;
  errorText: string | null;
}

const styles = StyleSheet.create({ footer: { gap: spacing.md, paddingTop: spacing.sm } });

export function ReviewSubmitFooter({ form, errorText }: ReviewSubmitFooterProps) {
  const { t } = useTranslation('reviews');
  return (
    <View style={styles.footer}>
      <Turnstile key={form.captchaKey} onToken={form.onCaptchaToken} />
      {errorText ? <Notice tone="danger">{errorText}</Notice> : null}
      <Button label={form.isEdit ? t('form.submitEdit') : t('form.submitNew')} loading={form.submitting} onPress={form.submit} />
      <Text variant="caption">
        <Trans t={t} i18nKey="form.termsNotice" components={{ link: <LinkText href="/legal/terms" /> }} />
      </Text>
    </View>
  );
}

export default ReviewSubmitFooter;
