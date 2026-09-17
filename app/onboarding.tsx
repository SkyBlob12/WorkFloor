import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AnonymityStep } from '@components/onboarding/AnonymityStep';
import { AuthStep } from '@components/onboarding/AuthStep';
import { OnboardingShell } from '@components/onboarding/OnboardingShell';
import { PrioritiesStep } from '@components/onboarding/PrioritiesStep';
import { ProfileStep } from '@components/onboarding/ProfileStep';
import { RatingStep } from '@components/onboarding/RatingStep';
import { PageHead } from '@components/shell/PageHead';
import { Button } from '@components/ui/Button';
import { useAuthUser } from '@hooks/useAuthUser';
import { useErrorMessage } from '@hooks/useErrorMessage';
import { useOnboardingFlow } from '@hooks/useOnboardingFlow';
import { useProviderSignIn } from '@hooks/useProviderSignIn';

const styles = StyleSheet.create({ next: { flex: 1 } });

export default function OnboardingScreen() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const user = useAuthUser();
  const errorMessage = useErrorMessage();
  const flow = useOnboardingFlow();
  const provider = useProviderSignIn();
  const left = useRef(false);
  // Relancé depuis les outils de dev par un utilisateur déjà connecté : ne pas fermer immédiatement.
  const signedInAtStart = useRef(user !== null);

  const leave = useCallback(
    (openSignIn = false) => {
      if (left.current) return;
      left.current = true;
      flow.finish();
      router.replace('/');
      if (openSignIn) router.push('/sign-in');
    },
    [flow, router],
  );

  // Connexion Apple / Google réussie : l'onboarding se ferme de lui-même.
  useEffect(() => {
    if (user && !signedInAtStart.current) leave();
  }, [user, leave]);

  return (
    <>
      <PageHead title={t('pageTitle')} />
      <OnboardingShell
        stepIndex={flow.stepIndex}
        stepCount={flow.stepCount}
        stepKey={flow.step}
        onBack={flow.stepIndex > 0 ? flow.back : undefined}
        actions={
          flow.step === 'auth' ? null : (
            <>
              <Button variant="secondary" label={t('skip')} onPress={flow.skip} />
              <Button label={t('continue')} onPress={flow.next} style={styles.next} />
            </>
          )
        }>
        {flow.step === 'profile' ? <ProfileStep /> : null}
        {flow.step === 'priorities' ? <PrioritiesStep /> : null}
        {flow.step === 'rating' ? <RatingStep /> : null}
        {flow.step === 'anonymity' ? <AnonymityStep /> : null}
        {flow.step === 'auth' ? (
          <AuthStep
            providerPending={provider.pending}
            errorText={provider.error ? errorMessage(provider.error) : null}
            onProvider={provider.continueWith}
            onEmail={() => leave(true)}
            onGuest={() => leave()}
          />
        ) : null}
      </OnboardingShell>
    </>
  );
}
