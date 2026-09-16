import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentColumn } from '@components/ui/ContentColumn';
import { IconButton } from '@components/ui/IconButton';
import { motion, size, spacing } from '@constants/theme';
import { useThemeColors } from '@hooks/useThemeColors';

import { OnboardingProgress } from './OnboardingProgress';

export interface OnboardingShellProps {
  stepIndex: number;
  stepCount: number;
  /** Change à chaque étape : rejoue l'animation d'entrée. */
  stepKey: string;
  onBack?: () => void;
  /** Actions du bas (Passer / Suivant). Sans actions, ni points ni barre du bas. */
  actions?: ReactNode;
  children: ReactNode;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  column: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', height: size.controlSmall },
  scroll: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.md },
  step: { gap: spacing.lg },
  footer: { gap: spacing.lg, paddingTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
});

/** Cadre des étapes : illustration et titre centrés, points de pagination et actions au pouce. */
export function OnboardingShell({ stepIndex, stepCount, stepKey, onBack, actions, children }: OnboardingShellProps) {
  const { t } = useTranslation('onboarding');
  const palette = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: palette.background, paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md },
      ]}>
      <ContentColumn width="reading" style={styles.column}>
        <View style={styles.top}>
          {onBack ? <IconButton icon="arrow-left" accessibilityLabel={t('back')} onPress={onBack} /> : null}
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Animated.View key={stepKey} entering={FadeIn.duration(motion.stepDuration)} style={styles.step}>
            {children}
          </Animated.View>
        </ScrollView>
        {actions ? (
          <View style={styles.footer}>
            <OnboardingProgress current={stepIndex} total={stepCount} />
            <View style={styles.actions}>{actions}</View>
          </View>
        ) : null}
      </ContentColumn>
    </View>
  );
}

export default OnboardingShell;
