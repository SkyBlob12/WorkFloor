import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/ui/Button';
import { Notice } from '@components/ui/Notice';
import { TextField } from '@components/ui/TextField';
import { useErrorMessage } from '@hooks/useErrorMessage';
import { useResetPasswordForm } from '@hooks/useResetPasswordForm';

export function ResetPasswordForm() {
  const { t } = useTranslation(['account', 'common']);
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const form = useResetPasswordForm();

  if (form.done) {
    return (
      <Notice
        tone="success"
        title={t('reset.doneTitle')}
        action={<Button size="sm" label={t('common:action.continue')} onPress={() => router.replace('/account')} />}>
        {t('reset.doneMessage')}
      </Notice>
    );
  }

  const issueText = form.issue
    ? t(`reset.issue.${form.issue.key}`, { count: form.issue.params?.count ?? 0 })
    : form.serviceError
      ? errorMessage(form.serviceError)
      : null;

  return (
    <>
      {issueText ? <Notice tone="danger">{issueText}</Notice> : null}
      <TextField
        label={t('reset.newPassword')}
        value={form.password}
        onChangeText={form.setPassword}
        secureTextEntry
        autoComplete="new-password"
      />
      <TextField
        label={t('reset.confirmation')}
        value={form.confirmation}
        onChangeText={form.setConfirmation}
        secureTextEntry
        autoComplete="new-password"
        onSubmitEditing={form.submit}
      />
      <Button label={t('reset.submit')} loading={form.submitting} onPress={form.submit} />
    </>
  );
}

export default ResetPasswordForm;
