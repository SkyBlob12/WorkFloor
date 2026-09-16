import { SERVICE_ERROR_CODES } from '@constants/serviceErrors';
import type { ServiceErrorCode } from '@app-types/domain';

/**
 * Les services ne produisent jamais de texte : ils jettent un code stable,
 * traduit au point d'affichage via `common:serviceError.<CODE>`.
 */
export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode) {
    super(code);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export function isServiceErrorCode(value: string): value is ServiceErrorCode {
  return (SERVICE_ERROR_CODES as readonly string[]).includes(value);
}

export function toServiceErrorCode(error: unknown): ServiceErrorCode {
  if (error instanceof ServiceError) return error.code;
  if (error instanceof Error && isServiceErrorCode(error.message)) return error.message;
  return 'UNKNOWN';
}
