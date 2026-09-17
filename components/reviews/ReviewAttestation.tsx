import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Checkbox } from '@components/ui/Checkbox';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import { useReviewFieldError } from '@hooks/useReviewFieldError';
import type { ReviewFormState } from '@hooks/useReviewForm';

export interface ReviewAttestationProps {
  form: ReviewFormState;
  companyName: string;
}

const styles = StyleSheet.create({ block: { gap: spacing.xs } });

/** Attestation sur l'honneur d'avoir travaillé dans l'entreprise, exigée à chaque envoi. */
export function ReviewAttestation({ form, companyName }: ReviewAttestationProps) {
  const { t } = useTranslation('reviews');
  const fieldError = useReviewFieldError();
  const error = fieldError(form.attestationError);
  return (
    <View style={styles.block}>
      <Checkbox checked={form.attested} onChange={form.setAttested} accessibilityLabel={t('form.attestationLabel')}>
        <Text variant="body">{t('form.attestation', { name: companyName })}</Text>
      </Checkbox>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default ReviewAttestation;
