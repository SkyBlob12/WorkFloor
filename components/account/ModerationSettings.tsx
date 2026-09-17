import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SettingsGroup } from '@components/ui/SettingsGroup';
import { SettingsRow } from '@components/ui/SettingsRow';
import { useModeratorStatus } from '@hooks/useModeration';

/** Accès à l'écran de modération, visible seulement pour un compte modérateur. */
export function ModerationSettings() {
  const { t } = useTranslation('account');
  const router = useRouter();
  const { isModerator } = useModeratorStatus();
  if (!isModerator) return null;
  return (
    <SettingsGroup title={t('settings.groups.moderation')}>
      <SettingsRow
        icon="shield"
        label={t('moderation.entry.label')}
        description={t('moderation.entry.description')}
        accessibilityRole="link"
        onPress={() => router.push('/moderation')}
      />
    </SettingsGroup>
  );
}

export default ModerationSettings;
