import { MIN_PASSWORD_LENGTH } from '@constants/auth';

/** Validation des formulaires d'authentification. Renvoie des descripteurs traduits à l'affichage. */
export type AuthMode = 'signin' | 'signup' | 'reset';

export interface AuthIssue {
  key: 'invalidEmail' | 'passwordTooShort';
  params?: { count: number };
}

export interface PasswordIssue {
  key: 'tooShort' | 'mismatch';
  params?: { count: number };
}

export interface AuthFormValues {
  mode: AuthMode;
  email: string;
  password: string;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function validateAuthForm({ mode, email, password }: AuthFormValues): AuthIssue | null {
  if (!EMAIL_RE.test(email.trim())) return { key: 'invalidEmail' };
  if (mode !== 'reset' && password.length < MIN_PASSWORD_LENGTH) {
    return { key: 'passwordTooShort', params: { count: MIN_PASSWORD_LENGTH } };
  }
  return null;
}

export function validateNewPassword(password: string, confirmation: string): PasswordIssue | null {
  if (password.length < MIN_PASSWORD_LENGTH) return { key: 'tooShort', params: { count: MIN_PASSWORD_LENGTH } };
  if (password !== confirmation) return { key: 'mismatch' };
  return null;
}
