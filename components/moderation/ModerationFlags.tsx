import { useMemo } from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Notice } from '@components/ui/Notice';
import { Text } from '@components/ui/Text';
import { hasModerationFlags, summarizeModerationFlags } from '@utils/moderationFlags';

export interface ModerationFlagsProps {
  flags: unknown;
}

/** Pourquoi la modération automatique a retenu l'avis (mots surveillés, IA, activité inhabituelle). */
export function ModerationFlags({ flags }: ModerationFlagsProps) {
  const { t } = useTranslation('account');
  const summary = useMemo(() => summarizeModerationFlags(flags), [flags]);
  if (!hasModerationFlags(summary)) return null;
  return (
    <Notice tone="warning" title={t('moderation.flags.title')}>
      <View>
        {summary.bannedTerms.length > 0 ? (
          <Text variant="caption" tone="default">
            {t('moderation.flags.bannedTerms', { terms: summary.bannedTerms.join(', ') })}
          </Text>
        ) : null}
        {summary.aiCategories.length > 0 ? (
          <Text variant="caption" tone="default">
            {t('moderation.flags.ai', { categories: summary.aiCategories.join(', ') })}
          </Text>
        ) : null}
        {summary.aiUnavailable ? (
          <Text variant="caption" tone="default">
            {t('moderation.flags.aiUnavailable')}
          </Text>
        ) : null}
        {summary.activitySignals.length > 0 ? (
          <Text variant="caption" tone="default">
            {t('moderation.flags.activity', { signals: summary.activitySignals.join(', ') })}
          </Text>
        ) : null}
      </View>
    </Notice>
  );
}

export default ModerationFlags;
