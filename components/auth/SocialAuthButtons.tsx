import { ActivityIndicator, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { AUTH_PROVIDERS, type AuthProvider } from '@constants/auth';
import { effects, iconSize, radius, size, spacing, type ColorName } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useThemeColors } from '@hooks/useThemeColors';
import type { IoniconName } from '@app-types/icons';

export interface SocialAuthButtonsProps {
  pending: AuthProvider | null;
  onPress: (provider: AuthProvider) => void;
}

interface ProviderStyle {
  icon: IoniconName;
  content: ColorName;
  tone: 'default' | 'inverse';
}

// Apple : bouton plein contrasté (guidelines Apple). Google : bouton clair bordé.
const PROVIDERS: Record<AuthProvider, ProviderStyle> = {
  apple: { icon: 'logo-apple', content: 'background', tone: 'inverse' },
  google: { icon: 'logo-google', content: 'text', tone: 'default' },
};

const useStyles = makeStyles((palette) => ({
  list: { gap: spacing.sm },
  button: {
    height: size.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
  },
  apple: { backgroundColor: palette.text },
  google: { borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  dimmed: { opacity: effects.disabledOpacity },
}));

export function SocialAuthButtons({ pending, onPress }: SocialAuthButtonsProps) {
  const { t } = useTranslation('account');
  const palette = useThemeColors();
  const styles = useStyles();
  return (
    <View style={styles.list}>
      {AUTH_PROVIDERS.map((provider) => {
        const config = PROVIDERS[provider];
        const label = t(`auth.provider.${provider}`);
        const busy = pending === provider;
        const disabled = pending !== null;
        return (
          <PressableScale
            key={provider}
            onPress={() => onPress(provider)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled, busy }}
            style={[styles.button, styles[provider], disabled && !busy && styles.dimmed]}>
            {busy ? (
              <ActivityIndicator size="small" color={palette[config.content]} />
            ) : (
              <Ionicons name={config.icon} size={iconSize.lg} color={palette[config.content]} />
            )}
            <Text variant="label" tone={config.tone}>
              {label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default SocialAuthButtons;
