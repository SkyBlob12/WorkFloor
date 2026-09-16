import { env } from '@lib/env';
import { supabase } from '@lib/supabase';
import type { ServiceErrorCode } from '@app-types/domain';

import { ServiceError } from './errors';
import { invokeFunction } from './functions';

const AUTH_ERROR_CODES: Record<string, ServiceErrorCode> = {
  invalid_credentials: 'AUTH_INVALID_CREDENTIALS',
  email_not_confirmed: 'AUTH_EMAIL_NOT_CONFIRMED',
  user_already_exists: 'AUTH_USER_ALREADY_EXISTS',
  weak_password: 'AUTH_WEAK_PASSWORD',
  over_request_rate_limit: 'AUTH_RATE_LIMITED',
  over_email_send_rate_limit: 'AUTH_EMAIL_RATE_LIMITED',
  captcha_failed: 'AUTH_CAPTCHA_FAILED',
};

export function toAuthError(error: { code?: string }): ServiceError {
  return new ServiceError(AUTH_ERROR_CODES[error.code ?? ''] ?? 'AUTH_FAILED');
}

export async function signIn(email: string, password: string, captchaToken: string | null): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
    options: { captchaToken: captchaToken ?? undefined },
  });
  if (error) throw toAuthError(error);
}

/**
 * Inscription sans email de confirmation : Supabase renvoie directement une session
 * (option « Confirm email » désactivée, voir SETUP.md). Sans session, la configuration n'est pas à jour.
 */
export async function signUp(email: string, password: string, captchaToken: string | null): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { captchaToken: captchaToken ?? undefined },
  });
  if (error) throw toAuthError(error);
  if (!data.session) throw new ServiceError('AUTH_EMAIL_NOT_CONFIRMED');
}

export async function sendPasswordReset(email: string, captchaToken: string | null): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${env.siteUrl}/reset-password`,
    captchaToken: captchaToken ?? undefined,
  });
  if (error) throw toAuthError(error);
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toAuthError(error);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** Droit à l'effacement : supprime le compte et, en cascade, toutes ses données. */
export async function deleteAccount(): Promise<void> {
  await invokeFunction<{ deleted: boolean }>('delete-account', {});
  await supabase.auth.signOut({ scope: 'local' });
}
