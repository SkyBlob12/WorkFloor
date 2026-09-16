import '@/i18n';

import { View } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppErrorFallback } from '@components/shell/AppErrorFallback';
import { AppStack } from '@components/shell/AppStack';
import { ConsentBanner } from '@components/shell/ConsentBanner';
import { LaunchSplash } from '@components/shell/LaunchSplash';
import { ToastHost } from '@components/ui/ToastHost';
import { navigationThemes } from '@constants/theme';
import { useColorSchemeName, useThemeColors } from '@hooks/useThemeColors';
import { initMonitoring } from '@lib/monitoring';
import { queryClient } from '@lib/queryClient';

initMonitoring();
void SplashScreen.preventAutoHideAsync();

const fill = { flex: 1 } as const;

export default function RootLayout() {
  const scheme = useColorSchemeName();
  const palette = useThemeColors();
  return (
    <GestureHandlerRootView style={fill}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={navigationThemes[scheme]}>
          <View style={[fill, { backgroundColor: palette.background }]}>
            <BottomSheetModalProvider>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <AppStack />
              <ConsentBanner />
              <ToastHost />
              <LaunchSplash />
            </BottomSheetModalProvider>
          </View>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <AppErrorFallback {...props} />;
}
