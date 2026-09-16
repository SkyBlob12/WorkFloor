import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';

import { isServiceErrorCode, ServiceError, toServiceErrorCode } from '@services/errors';
import { extractFunctionErrorCode } from '@services/functions';

describe('toServiceErrorCode', () => {
  it('reconnaît les codes connus', () => {
    expect(isServiceErrorCode('PERSONAL_DATA')).toBe(true);
    expect(isServiceErrorCode('personal_data')).toBe(false);
    expect(toServiceErrorCode(new ServiceError('VOTE_FAILED'))).toBe('VOTE_FAILED');
    expect(toServiceErrorCode(new Error('SEARCH_FAILED'))).toBe('SEARCH_FAILED');
    expect(toServiceErrorCode('n’importe quoi')).toBe('UNKNOWN');
  });
});

describe('extractFunctionErrorCode', () => {
  it('lit le code renvoyé par l’Edge Function', async () => {
    const response = new Response(JSON.stringify({ error: 'BANNED_TERM' }), { status: 422 });
    expect(await extractFunctionErrorCode(new FunctionsHttpError(response))).toBe('BANNED_TERM');
  });

  it('retombe sur SERVER_ERROR pour un code inconnu', async () => {
    const response = new Response(JSON.stringify({ error: 'nope' }), { status: 500 });
    expect(await extractFunctionErrorCode(new FunctionsHttpError(response))).toBe('SERVER_ERROR');
  });

  it('considère une erreur de transport comme réseau', async () => {
    expect(await extractFunctionErrorCode(new FunctionsFetchError(new Error('offline')))).toBe('NETWORK');
  });
});
