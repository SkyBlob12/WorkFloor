import { StyleSheet, Switch, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { FormSection } from '@components/ui/FormSection';
import { SegmentedControl } from '@components/ui/SegmentedControl';
import { Text } from '@components/ui/Text';
import { LOCALES, type AppLocale } from '@/i18n/locales';
import { spacing } from '@constants/theme';
import { useAppLocale } from '@hooks/useAppLocale';
import { useThemeColors } from '@hooks/useThemeColors';
import { env } from '@lib/env';
import { useConsentStore } from '@stores/consentStore';

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: spacing.xxs },
});

export function PreferencesSection() {
  const { t } = useTranslation('account');
  const palette = useThemeColors();
  const { locale, setLocale } = useAppLocale();
  const consent = useConsentStore((state) => state.consent);
  const setConsent = useConsentStore((state) => state.setConsent);

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
      {env.posthogKey ? (
        <View style={styles.row}>
          <View style={styles.body}>
            <Text variant="label">{t('preferences.analytics')}</Text>
            <Text variant="caption">{t('preferences.analyticsHint')}</Text>
          </View>
          <Switch
            value={consent === 'granted'}
            onValueChange={(next) => setConsent(next ? 'granted' : 'denied')}
            accessibilityLabel={t('preferences.analytics')}
            trackColor={{ true: palette.primaryFill, false: palette.border }}
            thumbColor={palette.white}
          />
        </View>
      ) : null}
    </FormSection>
  );
}

export default PreferencesSection;
