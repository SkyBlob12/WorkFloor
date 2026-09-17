import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SettingsGroup } from '@components/ui/SettingsGroup';
import { SettingsRow } from '@components/ui/SettingsRow';
import { APP } from '@constants/app';
import { LEGAL_DOCS, type LegalDoc } from '@constants/legal';
import { showErrorToast } from '@lib/toast';
import type { IconName } from '@app-types/icons';

const LEGAL_ICONS: Record<LegalDoc, IconName> = { terms: 'file-text', privacy: 'lock', notice: 'info' };

/** Contact et documents légaux. */
export function HelpSettings() {
  const { t } = useTranslation(['account', 'legal']);
  const router = useRouter();
  const email = APP.contactEmail;

  const contact = () =>
    Linking.openURL(`mailto:${email}`).catch(() => showErrorToast(t('settings.contact.unavailable', { email })));

  return (
    <SettingsGroup title={t('settings.groups.help')}>
      <SettingsRow icon="mail" label={t('settings.contact.label')} description={email} onPress={() => void contact()} />
      {LEGAL_DOCS.map((doc) => (
        <SettingsRow
          key={doc}
          icon={LEGAL_ICONS[doc]}
          label={t(`legal:${doc}.title`)}
          accessibilityRole="link"
          onPress={() => router.push(`/legal/${doc}`)}
        />
      ))}
    </SettingsGroup>
  );
}

export default HelpSettings;
