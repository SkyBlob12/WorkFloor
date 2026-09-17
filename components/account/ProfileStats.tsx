import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '@components/ui/Text';
import { getIntlTag } from '@/i18n/currentLocale';
import { radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { formatInteger } from '@utils/format';
import type { ProfileSummary } from '@utils/profile';

export interface ProfileStatsProps {
  summary: ProfileSummary;
}

const STAT_KEYS = ['published', 'pending', 'helpful'] as const;

const useStyles = makeStyles((palette) => ({
  row: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    gap: spacing.xxs,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
}));

/** Trois chiffres d'activité : avis publiés, en attente, votes « utile » reçus. */
export function ProfileStats({ summary }: ProfileStatsProps) {
  const { t } = useTranslation('account');
  const styles = useStyles();
  const intlTag = getIntlTag();
  return (
    <View style={styles.row} accessibilityRole="summary" accessibilityLabel={t('profile.stats.label')}>
      {STAT_KEYS.map((key) => (
        <View key={key} style={styles.stat}>
          <Text variant="title" weight="bold">
            {formatInteger(summary[key], intlTag)}
          </Text>
          <Text variant="tiny" numberOfLines={2}>
            {t(`profile.stats.${key}`, { count: summary[key] })}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default ProfileStats;
