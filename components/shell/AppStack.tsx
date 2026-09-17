import { Platform } from 'react-native';

import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TopBar } from '@components/navigation/TopBar';
import { useAppBootstrap } from '@hooks/useAppBootstrap';
import { useLayout } from '@hooks/useLayout';
import { useOnboardingGate } from '@hooks/useOnboardingGate';
import { useThemeColors } from '@hooks/useThemeColors';
import { isSupabaseConfigured } from '@lib/env';

import { SetupBanner } from './SetupBanner';

// iOS : les écrans courts s'ouvrent en feuille. Ailleurs : page classique avec bouton retour.
const sheetPresentation: 'modal' | 'card' = Platform.OS === 'ios' ? 'modal' : 'card';

export function AppStack() {
  const { t } = useTranslation('common');
  const palette = useThemeColors();
  const { isWide } = useLayout();
  useAppBootstrap();
  useOnboardingGate();

  return (
    <>
      {isWide ? <TopBar /> : null}
      {isSupabaseConfigured ? null : <SetupBanner />}
      <Stack
        screenOptions={{
          headerShown: !isWide,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: palette.primary,
          headerTitleStyle: { fontWeight: '600', color: palette.text },
          headerStyle: { backgroundColor: palette.background },
          contentStyle: { backgroundColor: palette.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="company/[id]/index" options={{ title: '' }} />
        <Stack.Screen name="company/[id]/review" options={{ title: t('screenTitle.review') }} />
        {/* Le formulaire affiche déjà son titre : header vide pour éviter le doublon. */}
        <Stack.Screen name="sign-in" options={{ headerTitle: '', presentation: sheetPresentation }} />
        <Stack.Screen
          name="report/[reviewId]"
          options={{ title: t('screenTitle.report'), presentation: sheetPresentation }}
        />
        <Stack.Screen name="reset-password" options={{ title: t('screenTitle.resetPassword') }} />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="legal/[doc]" options={{ title: '' }} />
        {/* L'écran affiche déjà son titre. */}
        <Stack.Screen name="moderation" options={{ title: '' }} />
      </Stack>
    </>
  );
}

export default AppStack;
