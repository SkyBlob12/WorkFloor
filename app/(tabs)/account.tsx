import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { DevTools } from '@components/account/DevTools';
import { SettingsSection } from '@components/account/SettingsSection';
import { SignedInPanel } from '@components/account/SignedInPanel';
import { SignedOutPanel } from '@components/account/SignedOutPanel';
import { PageHead } from '@components/shell/PageHead';
import { Screen } from '@components/ui/Screen';
import { Text } from '@components/ui/Text';
import { spacing } from '@constants/theme';
import { useAuthUser } from '@hooks/useAuthUser';

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  title: { paddingTop: spacing.sm },
});

export default function AccountScreen() {
  const { t } = useTranslation('account');
  const user = useAuthUser();
  return (
    <Screen inTabs width="reading">
      <PageHead title={t('pageTitle')} />
      <View style={styles.stack}>
        <Text variant="display" accessibilityRole="header" style={styles.title}>
          {t('pageTitle')}
        </Text>
        {user ? <SignedInPanel user={user} /> : <SignedOutPanel />}
        <SettingsSection user={user} />
        {__DEV__ ? <DevTools /> : null}
      </View>
    </Screen>
  );
}
