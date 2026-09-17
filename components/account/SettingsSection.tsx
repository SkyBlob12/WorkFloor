import { StyleSheet, View } from 'react-native';

import type { User } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';

import { SectionHeader } from '@components/ui/SectionHeader';
import { Text } from '@components/ui/Text';
import { APP } from '@constants/app';
import { spacing } from '@constants/theme';

import { AccountSettings } from './AccountSettings';
import { HelpSettings } from './HelpSettings';
import { ModerationSettings } from './ModerationSettings';
import { PreferencesSection } from './PreferencesSection';
import { SessionSettings } from './SessionSettings';

export interface SettingsSectionProps {
  user: User | null;
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg, paddingTop: spacing.md },
  version: { paddingTop: spacing.xs },
});

/** Paramètres de l'écran Compte : les groupes liés au compte n'apparaissent qu'une fois connecté. */
export function SettingsSection({ user }: SettingsSectionProps) {
  const { t } = useTranslation('account');
  const version = Constants.expoConfig?.version;
  return (
    <View style={styles.stack}>
      <SectionHeader title={t('settings.title')} />
      <PreferencesSection />
      {user ? <AccountSettings user={user} /> : null}
      {user ? <ModerationSettings /> : null}
      <HelpSettings />
      {user ? <SessionSettings /> : null}
      {version ? (
        <Text variant="tiny" align="center" style={styles.version}>
          {t('settings.version', { appName: APP.name, version })}
        </Text>
      ) : null}
    </View>
  );
}

export default SettingsSection;
