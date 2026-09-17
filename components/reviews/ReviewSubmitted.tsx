import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Notice } from '@components/ui/Notice';
import { Screen } from '@components/ui/Screen';
import { spacing } from '@constants/theme';
import type { HoldReason, ReviewStatus } from '@app-types/domain';

export interface ReviewSubmittedProps {
  status: ReviewStatus;
  holdReason: HoldReason | null;
  isEdit: boolean;
  companyId: string;
}

const styles = StyleSheet.create({ stack: { gap: spacing.md } });

export function ReviewSubmitted({ status, holdReason, isEdit, companyId }: ReviewSubmittedProps) {
  const { t } = useTranslation('reviews');
  const router = useRouter();
  return (
    <Screen width="reading">
      <View style={styles.stack}>
        {status === 'published' ? (
          <Notice tone="success" title={isEdit ? t('submitted.publishedTitleEdit') : t('submitted.publishedTitleNew')}>
            {t('submitted.publishedMessage')}
          </Notice>
        ) : holdReason === 'new_account' ? (
          <Notice tone="info" title={t('submitted.scheduledTitle')}>
            {t('submitted.scheduledMessage')}
          </Notice>
        ) : (
          <Notice tone="warning" title={t('submitted.pendingTitle')}>
            {t('submitted.pendingMessage')}
          </Notice>
        )}
        <Button label={t('submitted.back')} onPress={() => router.replace(`/company/${companyId}`)} />
      </View>
    </Screen>
  );
}

export default ReviewSubmitted;
