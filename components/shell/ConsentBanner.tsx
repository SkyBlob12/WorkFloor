import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Text } from '@components/ui/Text';
import { layout, radius, spacing } from '@constants/theme';
import { makeStyles } from '@hooks/makeStyles';
import { useTabBarInset } from '@hooks/useTabBarInset';
import { env } from '@lib/env';
import { useConsentStore } from '@stores/consentStore';

const useStyles = makeStyles((palette) => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    pointerEvents: 'box-none',
  },
  card: {
    width: '100%',
    maxWidth: layout.readingMaxWidth,
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
}));

/** Mesure d'audience en opt-in (recommandation CNIL). Invisible si PostHog n'est pas configuré. */
export function ConsentBanner() {
  const { t } = useTranslation('account');
  const styles = useStyles();
  const tabBarInset = useTabBarInset();
  const hydrated = useConsentStore((state) => state.hydrated);
  const consent = useConsentStore((state) => state.consent);
  const setConsent = useConsentStore((state) => state.setConsent);

  if (!env.posthogKey || !hydrated || consent !== null) return null;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(tabBarInset, spacing.lg) + spacing.sm }]}>
      <View style={styles.card}>
        <Text variant="label">{t('consent.title')}</Text>
        <Text variant="caption">{t('consent.message')}</Text>
        <View style={styles.actions}>
          <Button size="sm" label={t('consent.accept')} onPress={() => setConsent('granted')} />
          <Button size="sm" variant="secondary" label={t('consent.refuse')} onPress={() => setConsent('denied')} />
        </View>
      </View>
    </View>
  );
}

export default ConsentBanner;
