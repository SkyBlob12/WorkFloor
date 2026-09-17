/**
 * Mock Supabase centralisé. Utilisation dans un test :
 *   mockSupabaseResult({ error: { code: '23505' } });
 *   await expect(reportReview(...)).rejects.toMatchObject({ code: 'ALREADY_REPORTED' });
 */
interface MockResult {
  data?: unknown;
  error?: { code?: string; message?: string } | null;
  count?: number | null;
}

let nextResult: MockResult = { data: null, error: null, count: null };

export function mockSupabaseResult(result: MockResult): void {
  nextResult = { data: null, error: null, count: null, ...result };
}

const CHAINABLE = ['select', 'eq', 'in', 'order', 'range', 'limit','insert', 'update', 'upsert', 'delete', 'maybeSingle', 'single'];

function createQueryBuilder(): Record<string, unknown> {
  const builder: Record<string, unknown> = {};
  for (const method of CHAINABLE) builder[method] = jest.fn(() => builder);
  builder.then = (onFulfilled: (value: MockResult) => unknown, onRejected?: (reason: unknown) => unknown) =>
    Promise.resolve(nextResult).then(onFulfilled, onRejected);
  return builder;
}

export const supabase = {
  from: jest.fn(() => createQueryBuilder()),
  rpc: jest.fn(() => Promise.resolve(nextResult)),
  functions: { invoke: jest.fn() },
  auth: {
    signInWithPassword: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: { session: { access_token: 'token' } }, error: null })),
    signInWithOAuth: jest.fn(() => Promise.resolve({ data: { url: 'https://auth.test/authorize' }, error: null })),
    signInWithIdToken: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    exchangeCodeForSession: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    setSession: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
    updateUser: jest.fn(() => Promise.resolve({ error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
};

export function resetSupabaseMock(): void {
  nextResult = { data: null, error: null, count: null };
  jest.clearAllMocks();
}
