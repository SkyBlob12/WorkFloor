import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { FormSection } from '@components/ui/FormSection';
import { SegmentedControl } from '@components/ui/SegmentedControl';
import { Text } from '@components/ui/Text';
import { LOCALES, type AppLocale } from '@/i18n/locales';
import { spacing } from '@constants/theme';
import { useAppLocale } from '@hooks/useAppLocale';

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
});

export function PreferencesSection() {
  const { t } = useTranslation('account');
  const { locale, setLocale } = useAppLocale();

  return (
    <FormSection title={t('preferences.title')}>
      <View style={styles.field}>
        <Text variant="label">{t('preferences.language')}</Text>
        <SegmentedControl<AppLocale>
          label={t('preferences.language')}
          value={locale}
          onChange={(value) => void setLocale(value)}
          options={LOCALES.map(({ code, nativeName }) => ({ value: code, label: nativeName }))}
        />
      </View>
    </FormSection>
  );
}

export default PreferencesSection;
