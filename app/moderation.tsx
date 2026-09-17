import { useTranslation } from 'react-i18next';

import { ModerationQueue } from '@components/moderation/ModerationQueue';
import { PageHead } from '@components/shell/PageHead';
import { EmptyState } from '@components/ui/EmptyState';
import { LoadingState } from '@components/ui/LoadingState';
import { Screen } from '@components/ui/Screen';
import { useAuthInitializing } from '@hooks/useAuthUser';
import { useModeratorStatus } from '@hooks/useModeration';

/** Réservé aux comptes de la table `moderators` : chaque fonction SQL revérifie l'accès. */
export default function ModerationScreen() {
  const { t } = useTranslation('account');
  const initializing = useAuthInitializing();
  const { isModerator, isLoading } = useModeratorStatus();

  if (initializing || isLoading) return <LoadingState />;

  return (
    <>
      <PageHead title={t('moderation.title')} />
      {isModerator ? (
        <ModerationQueue />
      ) : (
        <Screen width="reading">
          <EmptyState icon="lock" title={t('moderation.forbiddenTitle')} message={t('moderation.forbiddenMessage')} />
        </Screen>
      )}
    </>
  );
}
