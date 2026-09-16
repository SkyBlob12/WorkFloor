import { StyleSheet, View } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Text } from '@components/ui/Text';
import { iconSize, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';

const useStyles = makeStyles((palette) => ({
  card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  icon: {
    width: iconSize.hero + spacing.md,
    height: iconSize.hero + spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: iconSize.hero,
    backgroundColor: palette.primaryMuted,
  },
}));

const layout = StyleSheet.create({
  text: { gap: spacing.xs },
  actions: { width: '100%', gap: spacing.sm },
});

export function SignedOutPanel() {
  const { t } = useTranslation('account');
  const router = useRouter();
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <Card style={styles.card}>
      <View style={styles.icon}>
        <Feather name="user" size={iconSize.xl} color={palette.primary} />
      </View>
      <View style={layout.text}>
        <Text variant="heading" align="center">
          {t('signedOut.title')}
        </Text>
        <Text variant="caption" align="center">
          {t('signedOut.message')}
        </Text>
      </View>
      <View style={layout.actions}>
        <Button label={t('signedOut.signIn')} onPress={() => router.push('/sign-in')} />
        <Button
          label={t('signedOut.signUp')}
          variant="secondary"
          onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'signup' } })}
        />
      </View>
    </Card>
  );
}

export default SignedOutPanel;
