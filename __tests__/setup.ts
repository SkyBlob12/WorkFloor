// Setup global Jest : mocks natifs et i18n initialisé en français (langue de référence).
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'fr' }] }));

jest.mock('@lib/supabase', () => jest.requireActual('./mocks/supabase'));

jest.mock('@lib/toast', () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
  showUndoToast: jest.fn(),
  hideToast: jest.fn(),
}));

jest.mock('@lib/analytics', () => ({
  enableAnalytics: jest.fn(),
  disableAnalytics: jest.fn(),
  trackScreen: jest.fn(),
  track: jest.fn(),
}));

// eslint-disable-next-line import/first
import '@/i18n';
