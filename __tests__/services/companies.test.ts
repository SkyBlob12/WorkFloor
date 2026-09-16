import { listCompanyDirectory } from '@services/companies';

import { mockSupabaseResult, resetSupabaseMock, supabase } from '../mocks/supabase';

describe('listCompanyDirectory', () => {
  beforeEach(() => resetSupabaseMock());

  it('lit la vue publique des entreprises', async () => {
    mockSupabaseResult({ data: [{ id: 'c1', name: 'Atelier Lumen' }] });
    await expect(listCompanyDirectory(50)).resolves.toEqual([{ id: 'c1', name: 'Atelier Lumen' }]);
    expect(supabase.from).toHaveBeenCalledWith('companies_with_stats');
  });

  it('convertit une erreur en code stable', async () => {
    mockSupabaseResult({ error: { code: 'XX000' } });
    await expect(listCompanyDirectory()).rejects.toMatchObject({ code: 'LOAD_FAILED' });
  });
});
