import { act, renderHook } from '@testing-library/react-native';

import { useCompanyDirectory } from '@hooks/useCompanyDirectory';
import { useCompanyExplorer } from '@hooks/useCompanyExplorer';
import { useCompanySearch } from '@hooks/useCompanySearch';
import type { Company } from '@app-types/domain';

jest.mock('@hooks/useDebouncedValue', () => ({ useDebouncedValue: (value: string) => value }));
jest.mock('@hooks/useCompanyDirectory', () => ({ useCompanyDirectory: jest.fn() }));
jest.mock('@hooks/useCompanySearch', () => ({ useCompanySearch: jest.fn() }));

const make = (name: string, naf: string, city: string, reviews: number, avg: number | null): Company =>
  ({ id: name, name, naf_code: naf, city, review_count: reviews, avg_overall: avg }) as Company;

const directory = [
  make('Lumen', '62.01Z', 'Lyon', 6, 4.3),
  make('Nordline', '52.29B', 'Lille', 5, 2.4),
  make('Pixel', '63.12Z', 'Lyon', 3, 4.8),
];

describe('useCompanyExplorer', () => {
  beforeEach(() => {
    jest.mocked(useCompanyDirectory).mockReturnValue({ data: directory, isFetching: false } as never);
    jest.mocked(useCompanySearch).mockReturnValue({ data: [directory[1]], isFetching: false } as never);
  });

  it('prépare la page de découverte à partir de l’annuaire', async () => {
    const { result } = await renderHook(() => useCompanyExplorer());
    expect(result.current.mode).toBe('discover');
    expect(result.current.sectors[0]).toEqual({ value: 'J', count: 2 });
    expect(result.current.topRated.map((item) => item.name)).toEqual(['Pixel', 'Lumen', 'Nordline']);
    expect(result.current.totals).toEqual({ companies: 3, reviews: 14 });
    expect(result.current.items[0].name).toBe('Lumen');
    expect(useCompanySearch).toHaveBeenLastCalledWith('', false);
  });

  it('filtre par secteur puis par ville, et bascule en résultats', async () => {
    const { result } = await renderHook(() => useCompanyExplorer());
    await act(async () => result.current.toggleSector('J'));
    expect(result.current.mode).toBe('results');
    expect(result.current.items.map((item) => item.name)).toEqual(['Lumen', 'Pixel']);

    await act(async () => result.current.toggleCity('Lille'));
    expect(result.current.items).toEqual([]);

    await act(async () => result.current.clearFilters());
    expect(result.current.mode).toBe('discover');
  });

  it('utilise la recherche serveur dès qu’un terme est saisi', async () => {
    const { result } = await renderHook(() => useCompanyExplorer());
    await act(async () => result.current.setQuery(' nord '));
    expect(useCompanySearch).toHaveBeenLastCalledWith('nord', true);
    expect(result.current.items.map((item) => item.name)).toEqual(['Nordline']);
  });
});
