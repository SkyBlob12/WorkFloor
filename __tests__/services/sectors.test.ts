import { listSectorPhotos } from '@services/sectors';

import { mockSupabaseResult, resetSupabaseMock, supabase } from '../mocks/supabase';

describe('listSectorPhotos', () => {
  beforeEach(() => resetSupabaseMock());

  it('indexe les photos par section NAF', async () => {
    mockSupabaseResult({
      data: [
        { section: 'F', image_url: 'https://cdn.test/btp.jpg' },
        { section: 'J', image_url: 'https://cdn.test/numerique.jpg' },
      ],
    });
    await expect(listSectorPhotos()).resolves.toEqual({
      F: 'https://cdn.test/btp.jpg',
      J: 'https://cdn.test/numerique.jpg',
    });
    expect(supabase.from).toHaveBeenCalledWith('sector_photos');
  });

  it('ignore les sections inconnues et les URL vides', async () => {
    mockSupabaseResult({
      data: [
        { section: 'Z', image_url: 'https://cdn.test/z.jpg' },
        { section: 'A', image_url: '' },
      ],
    });
    await expect(listSectorPhotos()).resolves.toEqual({});
  });

  it('renvoie un objet vide sans données', async () => {
    mockSupabaseResult({ data: null });
    await expect(listSectorPhotos()).resolves.toEqual({});
  });

  it('convertit une erreur en code stable', async () => {
    mockSupabaseResult({ error: { code: '42P01' } });
    await expect(listSectorPhotos()).rejects.toMatchObject({ code: 'LOAD_FAILED' });
  });
});
