import { StyleSheet, View } from 'react-native';

import { Trans, useTranslation } from 'react-i18next';

import { AuthTermsNotice } from '@components/auth/AuthTermsNotice';
import { SocialAuthButtons } from '@components/auth/SocialAuthButtons';
import { Wordmark } from '@components/navigation/Wordmark';
import { Button } from '@components/ui/Button';
import { Notice } from '@components/ui/Notice';
import { Text } from '@components/ui/Text';
import type { AuthProvider } from '@constants/auth';
import { size, spacing } from '@constants/theme';

import { OnboardingStage } from './OnboardingStage';
import { SampleReviewCard } from './SampleReviewCard';
import { ACCENT, StepHeadline } from './StepHeadline';

export interface AuthStepProps {
  providerPending: AuthProvider | null;
  errorText: string | null;
  onProvider: (provider: AuthProvider) => void;
  onEmail: () => void;
  onGuest: () => void;
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center' },
  collage: { width: '100%', maxWidth: size.stageCard, gap: spacing.sm },
  actions: { gap: spacing.sm },
  guest: { gap: spacing.xxs },
});

/** Dernière étape : Apple, Google, email, ou lecture libre en invité. */
export function AuthStep({ providerPending, errorText, onProvider, onEmail, onGuest }: AuthStepProps) {
  const { t } = useTranslation(['onboarding', 'reviews']);
  return (
    <>
      <OnboardingStage compact>
        <View style={styles.collage} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <SampleReviewCard icon="smile" label={t('reviews:criterion.culture')} rating={4.5} tilt="slightLeft" align="flex-start" />
          <SampleReviewCard icon="trending-up" label={t('reviews:criterion.salary')} rating={3.8} tilt="right" align="flex-end" />
          <SampleReviewCard icon="users" label={t('reviews:criterion.management')} rating={4.1} tilt="left" align="center" />
        </View>
      </OnboardingStage>
      <View style={styles.brand}>
        <Wordmark large />
      </View>
      <StepHeadline title={<Trans t={t} i18nKey="auth.title" components={ACCENT} />} subtitle={t('auth.subtitle')} />
      {errorText ? <Notice tone="danger">{errorText}</Notice> : null}
      <View style={styles.actions}>
        <SocialAuthButtons pending={providerPending} onPress={onProvider} />
        <Button variant="secondary" icon="mail" label={t('auth.email')} onPress={onEmail} disabled={providerPending !== null} />
        <View style={styles.guest}>
          <Button variant="ghost" label={t('auth.guest')} onPress={onGuest} disabled={providerPending !== null} />
          <Text variant="caption" align="center">
            {t('auth.guestHint')}
          </Text>
        </View>
      </View>
      <AuthTermsNotice />
    </>
  );
}

export default AuthStep;
