import { StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Notice } from '@components/ui/Notice';
import { SegmentedControl } from '@components/ui/SegmentedControl';
import { Text } from '@components/ui/Text';
import { EMAIL_AUTH_MODES } from '@constants/auth';
import { spacing } from '@constants/theme';
import { useErrorMessage } from '@hooks/useErrorMessage';
import { useLayout } from '@hooks/useLayout';
import type { SignInFormState } from '@hooks/useSignInForm';

import { AuthDivider } from './AuthDivider';
import { AuthTermsNotice } from './AuthTermsNotice';
import { EmailAuthFields } from './EmailAuthFields';
import { SocialAuthButtons } from './SocialAuthButtons';

export interface AuthFormProps {
  form: SignInFormState;
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  formWide: { paddingTop: spacing.md },
  header: { gap: spacing.xs },
});

/** Connexion et inscription sur un seul écran : Apple, Google, puis email. */
export function AuthForm({ form }: AuthFormProps) {
  const { t } = useTranslation('account');
  const errorMessage = useErrorMessage();
  const { isWide } = useLayout();
  const { mode } = form;

  const issueText = form.issue
    ? t(`auth.issue.${form.issue.key}`, { count: form.issue.params?.count ?? 0 })
    : form.serviceError
      ? errorMessage(form.serviceError)
      : null;

  return (
    <View style={[styles.form, isWide && styles.formWide]}>
      <View style={styles.header}>
        <Text variant="display" accessibilityRole="header">
          {mode === 'reset' ? t('auth.title.reset') : t('auth.welcomeTitle')}
        </Text>
        <Text variant="body" tone="muted">
          {mode === 'reset' ? t('auth.resetMessage') : t('auth.welcomeMessage')}
        </Text>
      </View>

      {form.notice ? <Notice tone="success">{t(`auth.notice.${form.notice}`)}</Notice> : null}
      {issueText ? <Notice tone="danger">{issueText}</Notice> : null}

      {mode === 'reset' ? null : (
        <>
          <SocialAuthButtons pending={form.providerPending} onPress={form.continueWith} />
          <AuthDivider label={t('auth.divider')} />
          <SegmentedControl
            label={t('auth.modeLabel')}
            value={mode}
            onChange={form.switchMode}
            options={EMAIL_AUTH_MODES.map((value) => ({ value, label: t(`auth.mode.${value}`) }))}
          />
        </>
      )}

      <EmailAuthFields form={form} />
      {mode === 'reset' ? null : <AuthTermsNotice />}
    </View>
  );
}

export default AuthForm;
