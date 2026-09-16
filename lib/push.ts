import { Platform } from 'react-native';

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { translate } from '@/i18n/currentLocale';

import { supabase } from './supabase';

/**
 * Enregistre le jeton Expo Push de l'appareil pour l'utilisateur connecté.
 * Non branché pour l'instant : à appeler quand un cas d'usage existe
 * (ex. "votre avis a été jugé utile"), pour ne pas demander la permission pour rien.
 * Ne fonctionne ni dans Expo Go ni sans `eas init`.
 */
export async function registerPushToken(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) return null;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: translate('common:notifications.defaultChannel'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await supabase
    .from('push_tokens')
    .upsert({ token, platform: Platform.OS, updated_at: new Date().toISOString() });
  return token;
}
