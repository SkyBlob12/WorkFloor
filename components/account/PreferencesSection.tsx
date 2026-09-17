import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@components/ui/SegmentedControl';
import { SettingsGroup } from '@components/ui/SettingsGroup';
import { SettingsRow } from '@components/ui/SettingsRow';
import { LOCALES, type AppLocale } from '@/i18n/locales';
import { THEME_MODES, type ThemeMode } from '@constants/appearance';
import { useAppLocale } from '@hooks/useAppLocale';
import { useThemeStore } from '@stores/themeStore';

/** Langue et apparence : réglages locaux, disponibles connecté ou non. */
export function PreferencesSection() {
  const { t } = useTranslation('account');
  const { locale, setLocale } = useAppLocale();
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);

  return (
    <SettingsGroup title={t('preferences.title')}>
      <SettingsRow icon="globe" label={t('preferences.language')}>
        <SegmentedControl<AppLocale>
          label={t('preferences.language')}
          value={locale}
          onChange={(value) => void setLocale(value)}
          options={LOCALES.map(({ code, nativeName }) => ({ value: code, label: nativeName }))}
        />
      </SettingsRow>
      <SettingsRow icon="moon" label={t('settings.appearance.label')}>
        <SegmentedControl<ThemeMode>
          label={t('settings.appearance.label')}
          value={themeMode}
          onChange={setThemeMode}
          options={THEME_MODES.map((mode) => ({ value: mode, label: t(`settings.appearance.${mode}`) }))}
        />
      </SettingsRow>
    </SettingsGroup>
  );
}

export default PreferencesSection;
