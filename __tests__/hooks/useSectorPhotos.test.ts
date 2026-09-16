import { useQuery } from '@tanstack/react-query';

import { renderHook } from '@testing-library/react-native';

import { useSectorPhotos } from '@hooks/useSectorPhotos';

jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }));

const mockedUseQuery = useQuery as jest.Mock;

describe('useSectorPhotos', () => {
  beforeEach(() => mockedUseQuery.mockReset());

  it('renvoie les photos chargées', async () => {
    mockedUseQuery.mockReturnValue({ data: { F: 'https://cdn.test/btp.jpg' } });
    const { result } = await renderHook(() => useSectorPhotos());
    expect(result.current).toEqual({ F: 'https://cdn.test/btp.jpg' });
  });

  it('renvoie un objet vide tant que rien n’est chargé ou en cas d’échec', async () => {
    mockedUseQuery.mockReturnValue({ data: undefined });
    const { result } = await renderHook(() => useSectorPhotos());
    expect(result.current).toEqual({});
  });

  it('reste silencieux en cas d’erreur (pas de toast, pas de nouvel essai)', async () => {
    mockedUseQuery.mockReturnValue({ data: undefined });
    await renderHook(() => useSectorPhotos());
    expect(mockedUseQuery).toHaveBeenCalledWith(expect.objectContaining({ retry: false, meta: { inlineError: true } }));
  });
});
