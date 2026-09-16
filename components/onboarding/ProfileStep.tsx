import { StyleSheet, View } from 'react-native';

import { Trans, useTranslation } from 'react-i18next';

import { USER_PROFILES, type UserProfile } from '@constants/onboarding';
import { spacing } from '@constants/theme';
import type { IconName } from '@app-types/icons';

import { ChoiceCard } from './ChoiceCard';
import type { CardTilt } from './FloatingCard';
import { OnboardingStage } from './OnboardingStage';
import { ACCENT, StepHeadline } from './StepHeadline';

export interface ProfileStepProps {
  value: UserProfile | null;
  onChange: (profile: UserProfile) => void;
}

const PROFILE_ICONS: Record<UserProfile, IconName> = { jobSeeker: 'search', employee: 'briefcase', curious: 'eye' };
const PROFILE_TILTS: Record<UserProfile, CardTilt> = { jobSeeker: 'slightLeft', employee: 'slightRight', curious: 'left' };

const styles = StyleSheet.create({ list: { width: '100%', alignItems: 'center', gap: spacing.sm } });

export function ProfileStep({ value, onChange }: ProfileStepProps) {
  const { t } = useTranslation('onboarding');
  return (
    <>
      <OnboardingStage>
        <View accessibilityRole="radiogroup" accessibilityLabel={t('profile.a11yGroup')} style={styles.list}>
          {USER_PROFILES.map((profile) => (
            <ChoiceCard
              key={profile}
              icon={PROFILE_ICONS[profile]}
              tilt={PROFILE_TILTS[profile]}
              title={t(`profile.options.${profile}.title`)}
              description={t(`profile.options.${profile}.description`)}
              selected={value === profile}
              onPress={() => onChange(profile)}
            />
          ))}
        </View>
      </OnboardingStage>
      <StepHeadline title={<Trans t={t} i18nKey="profile.title" components={ACCENT} />} subtitle={t('profile.subtitle')} />
    </>
  );
}

export default ProfileStep;
