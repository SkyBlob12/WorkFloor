import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PageHead } from '@components/shell/PageHead';
import { Button } from '@components/ui/Button';
import { Screen } from '@components/ui/Screen';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';

const styles = StyleSheet.create({ stack: { gap: spacing.md, paddingVertical: spacing.xxl } });

export default function NotFoundScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();
  return (
    <Screen width="reading">
      <PageHead title={t('screenTitle.notFound')} headerTitle={t('screenTitle.notFound')} />
      <View style={styles.stack}>
        <Text variant="title">{t('error.notFoundTitle')}</Text>
        <Text variant="body" tone="muted">
          {t('error.notFoundMessage')}
        </Text>
        <Button label={t('action.backHome')} onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
