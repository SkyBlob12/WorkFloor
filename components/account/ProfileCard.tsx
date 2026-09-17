import { useMemo } from 'react';
import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

import { Card } from '@components/ui/Card';
import { Pill } from '@components/ui/Pill';
import { Text } from '@components/ui/Text';
import { getIntlTag } from '@/i18n/currentLocale';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useMyReviews } from '@hooks/useMyReview';
import { useThemeColors } from '@hooks/useThemeColors';
import { formatMonth } from '@utils/format';
import { authProviderOf, summarizeMyReviews } from '@utils/profile';

import { ProfileStats } from './ProfileStats';

export interface ProfileCardProps {
  user: User;
}

const useStyles = makeStyles((palette) => ({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: size.avatarLarge,
    height: size.avatarLarge,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.primaryMuted,
  },
  body: { flex: 1, gap: spacing.xxs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
}));

/** En-tête du compte : adresse privée, ancienneté, mode de connexion et chiffres d'activité. */
export function ProfileCard({ user }: ProfileCardProps) {
  const { t } = useTranslation('account');
  const palette = useThemeColors();
  const styles = useStyles();
  const { data: reviews } = useMyReviews();
  const summary = useMemo(() => summarizeMyReviews(reviews), [reviews]);
  const provider = authProviderOf(user.app_metadata);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Feather name="user" size={iconSize.xl} color={palette.primary} />
        </View>
        <View style={styles.body}>
          <Text variant="heading" numberOfLines={1}>
            {user.email || t('signedIn.title')}
          </Text>
          <Text variant="caption">{t('signedIn.connectedAs')}</Text>
        </View>
      </View>
      <View style={styles.pills}>
        <Pill icon="shield" tone="primary" label={t('signedIn.memberSince', { month: formatMonth(user.created_at, getIntlTag()) })} />
        {provider ? <Pill icon="log-in" label={t('profile.providerLabel', { provider: t(`profile.provider.${provider}`) })} /> : null}
      </View>
      <ProfileStats summary={summary} />
    </Card>
  );
}

export default ProfileCard;
