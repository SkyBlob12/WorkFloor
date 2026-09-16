import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ErrorBoundaryProps } from 'expo-router';

import { translate } from '@/i18n/currentLocale';
import { colors, radius, spacing, typography } from '@constants/theme';
import { captureError } from '@lib/monitoring';

const palette = colors.light;

/**
 * Rendu quand le layout racine plante : hors des providers, d'où une palette claire fixe
 * alimentée par les mêmes tokens.
 */
export function AppErrorFallback({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    captureError(error);
  }, [error]);

  const retryLabel = translate('common:action.retry');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate('common:error.title')}</Text>
      <Text style={styles.message}>{translate('common:error.boundaryMessage')}</Text>
      <Pressable onPress={retry} accessibilityRole="button" accessibilityLabel={retryLabel} style={styles.button}>
        <Text style={styles.buttonLabel}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: palette.background,
  },
  title: { fontSize: typography.title.fontSize, fontWeight: '700', color: palette.text },
  message: { fontSize: typography.label.fontSize, color: palette.textMuted, textAlign: 'center' },
  button: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    backgroundColor: palette.ink,
  },
  buttonLabel: { color: palette.onInk, fontWeight: '600' },
});

export default AppErrorFallback;
