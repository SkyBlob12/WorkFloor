import { View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Notice } from '@components/ui/Notice';
import { spacing } from '@constants/theme';
import { useLayout } from '@hooks/useLayout';

/** Affiché tant que les variables Supabase ne sont pas renseignées dans .env. */
export function SetupBanner() {
  const { t } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        paddingTop: (isWide ? 0 : insets.top) + spacing.sm,
      }}>
      <Notice tone="warning" title={t('setup.title')}>
        {t('setup.message')}
      </Notice>
    </View>
  );
}

export default SetupBanner;
