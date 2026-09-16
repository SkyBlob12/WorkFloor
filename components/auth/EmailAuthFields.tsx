import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { PressableScale } from '@components/ui/PressableScale';
import { Text } from '@components/ui/Text';
import { TextField } from '@components/ui/TextField';
import { MIN_PASSWORD_LENGTH } from '@constants/auth';
import { spacing } from '@constants/theme';
import type { SignInFormState } from '@hooks/useSignInForm';

export interface EmailAuthFieldsProps {
  form: SignInFormState;
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
  link: { alignSelf: 'center', paddingVertical: spacing.xs },
});

export function EmailAuthFields({ form }: EmailAuthFieldsProps) {
  const { t } = useTranslation('account');
  const { mode } = form;
  const secondaryLink =
    mode === 'signin'
      ? { label: t('auth.toReset'), target: 'reset' as const }
      : mode === 'reset'
        ? { label: t('auth.toSignin'), target: 'signin' as const }
        : null;

  return (
    <View style={styles.fields}>
      <TextField
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={form.email}
        onChangeText={form.setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      {mode === 'reset' ? null : (
        <TextField
          label={t('auth.password')}
          value={form.password}
          onChangeText={form.setPassword}
          secureTextEntry
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          textContentType={mode === 'signup' ? 'newPassword' : 'password'}
          hint={mode === 'signup' ? t('auth.passwordHint', { count: MIN_PASSWORD_LENGTH }) : undefined}
          onSubmitEditing={form.submit}
        />
      )}
      <Button label={t(`auth.submit.${mode}`)} loading={form.submitting} onPress={form.submit} />
      {secondaryLink ? (
        <PressableScale
          onPress={() => form.switchMode(secondaryLink.target)}
          accessibilityRole="button"
          accessibilityLabel={secondaryLink.label}
          style={styles.link}>
          <Text variant="label" tone="primary">
            {secondaryLink.label}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

export default EmailAuthFields;
