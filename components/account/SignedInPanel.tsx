import { View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { Card } from '@components/ui/Card';
import { Text } from '@components/ui/Text';
import { iconSize, radius, size, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

import { BlockedAuthorsSection } from './BlockedAuthorsSection';
import { MyReviewsSection } from './MyReviewsSection';

export interface SignedInPanelProps {
  email: string;
}

const useStyles = makeStyles((palette) => ({
  stack: { gap: spacing.md },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: size.avatar,
    height: size.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: palette.primaryMuted,
  },
  body: { flex: 1, gap: spacing.xxs },
}));

export function SignedInPanel({ email }: SignedInPanelProps) {
  const { t } = useTranslation('account');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.stack}>
      <Card style={styles.profile}>
        <View style={styles.icon}>
          <Feather name="user" size={iconSize.lg} color={palette.primary} />
        </View>
        <View style={styles.body}>
          <Text variant="label" numberOfLines={1}>
            {email || t('signedIn.title')}
          </Text>
          <Text variant="caption">{t('signedIn.connectedAs')}</Text>
        </View>
      </Card>
      <MyReviewsSection />
      <BlockedAuthorsSection />
    </View>
  );
}

export default SignedInPanel;
