import { useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import type { AuthProvider } from '@constants/auth';
import { sendPasswordReset, signIn, signUp } from '@services/account';
import { validateAuthForm, type AuthIssue, type AuthMode } from '@utils/authRules';

import { useProviderSignIn } from './useProviderSignIn';

export type AuthNotice = 'resetSent';

export interface SignInFormState {
  mode: AuthMode;
  switchMode: (mode: AuthMode) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  captchaKey: number;
  onCaptchaToken: (token: string | null) => void;
  submit: () => void;
  submitting: boolean;
  /** Connexion Apple / Google. */
  continueWith: (provider: AuthProvider) => void;
  providerPending: AuthProvider | null;
  issue: AuthIssue | null;
  serviceError: Error | null;
  notice: AuthNotice | null;
}

export function useSignInForm(initialMode: AuthMode): SignInFormState {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [issue, setIssue] = useState<AuthIssue | null>(null);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const provider = useProviderSignIn();

  const emailMutation = useMutation<AuthNotice | null, Error, AuthMode>({
    meta: { inlineError: true },
    mutationFn: async (currentMode) => {
      if (currentMode === 'signin') await signIn(email, password, captchaToken);
      else if (currentMode === 'signup') await signUp(email, password, captchaToken);
      else {
        await sendPasswordReset(email, captchaToken);
        return 'resetSent';
      }
      return null;
    },
  });

  const clearFeedback = useCallback(() => {
    setIssue(null);
    setNotice(null);
    emailMutation.reset();
    provider.reset();
  }, [emailMutation, provider]);

  const switchMode = useCallback(
    (next: AuthMode) => {
      setMode(next);
      clearFeedback();
    },
    [clearFeedback],
  );

  const submit = useCallback(() => {
    const found = validateAuthForm({ mode, email, password });
    clearFeedback();
    setIssue(found);
    if (found) return;
    emailMutation.mutate(mode, {
      onSuccess: setNotice,
      onSettled: () => {
        setCaptchaToken(null);
        setCaptchaKey((key) => key + 1);
      },
    });
  }, [mode, email, password, clearFeedback, emailMutation]);

  const continueWith = useCallback(
    (target: AuthProvider) => {
      clearFeedback();
      provider.continueWith(target);
    },
    [clearFeedback, provider],
  );

  return {
    mode,
    switchMode,
    email,
    setEmail,
    password,
    setPassword,
    captchaKey,
    onCaptchaToken: setCaptchaToken,
    submit,
    submitting: emailMutation.isPending,
    continueWith,
    providerPending: provider.pending,
    issue,
    serviceError: emailMutation.error ?? provider.error,
    notice,
  };
}
