import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Notice } from '@components/ui/Notice';
import { Screen } from '@components/ui/Screen';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import type { ReportFormState } from '@hooks/useReportForm';

export interface ReportDoneProps {
  form: ReportFormState;
}

const styles = StyleSheet.create({ stack: { gap: spacing.md } });

export function ReportDone({ form }: ReportDoneProps) {
  const { t } = useTranslation(['reviews', 'common']);
  const router = useRouter();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Screen width="reading">
      <View style={styles.stack}>
        <Notice tone="success" title={t('report.doneTitle')}>
          {t('report.doneMessage')}
        </Notice>
        {form.blocked ? (
          <Text variant="caption">{t('report.blocked')}</Text>
        ) : (
          <Button variant="secondary" icon="eye-off" label={t('report.blockToo')} loading={form.blocking} onPress={form.blockAuthor} />
        )}
        <Button label={t('common:action.close')} onPress={close} />
      </View>
    </Screen>
  );
}

export default ReportDone;
