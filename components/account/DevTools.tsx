import { StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { FormSection } from '@components/ui/FormSection';
import { ONBOARDING_PATH } from '@constants/onboarding';

const styles = StyleSheet.create({ row: { flexDirection: 'row' } });

/** Raccourcis de développement. Monté uniquement si `__DEV__` : absent des builds de production. */
export function DevTools() {
  const { t } = useTranslation('account');
  const router = useRouter();
  return (
    <FormSection title={t('devTools.title')} description={t('devTools.description')}>
      <View style={styles.row}>
        <Button
          size="sm"
          variant="secondary"
          icon="play"
          label={t('devTools.onboarding')}
          onPress={() => router.push(ONBOARDING_PATH)}
        />
      </View>
    </FormSection>
  );
}

export default DevTools;
