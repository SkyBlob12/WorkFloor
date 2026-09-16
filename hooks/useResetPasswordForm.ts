import { useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { updatePassword } from '@services/account';
import { validateNewPassword, type PasswordIssue } from '@utils/authRules';

export interface ResetPasswordFormState {
  password: string;
  setPassword: (value: string) => void;
  confirmation: string;
  setConfirmation: (value: string) => void;
  issue: PasswordIssue | null;
  serviceError: Error | null;
  submitting: boolean;
  done: boolean;
  submit: () => void;
}

export function useResetPasswordForm(): ResetPasswordFormState {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [issue, setIssue] = useState<PasswordIssue | null>(null);
  const mutation = useMutation<void, Error, string>({ mutationFn: updatePassword, meta: { inlineError: true } });

  const submit = useCallback(() => {
    const found = validateNewPassword(password, confirmation);
    setIssue(found);
    if (!found) mutation.mutate(password);
  }, [password, confirmation, mutation]);

  return {
    password,
    setPassword,
    confirmation,
    setConfirmation,
    issue,
    serviceError: mutation.error,
    submitting: mutation.isPending,
    done: mutation.isSuccess,
    submit,
  };
}
