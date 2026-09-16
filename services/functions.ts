import { FunctionsHttpError } from '@supabase/supabase-js';

import { supabase } from '@lib/supabase';
import { isRecord } from '@utils/guards';
import type { ServiceErrorCode } from '@app-types/domain';

import { isServiceErrorCode, ServiceError } from './errors';

/** Lit le code d'erreur renvoyé par une Edge Function (`{ error: "CODE" }`). */
export async function extractFunctionErrorCode(error: unknown): Promise<ServiceErrorCode> {
  if (!(error instanceof FunctionsHttpError)) return 'NETWORK';
  try {
    const payload: unknown = await (error.context as Response).json();
    if (isRecord(payload) && typeof payload.error === 'string' && isServiceErrorCode(payload.error)) {
      return payload.error;
    }
  } catch {
    // Corps illisible : on retombe sur une erreur serveur générique.
  }
  return 'SERVER_ERROR';
}

export async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw new ServiceError(await extractFunctionErrorCode(error));
  return data as T;
}
