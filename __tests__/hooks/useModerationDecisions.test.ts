import { act, renderHook } from '@testing-library/react-native';

import { useModerationDecisions } from '@hooks/useModerationDecisions';
import { UNDO_DELAY_MS } from '@constants/reviews';
import type { ModerationItem } from '@app-types/domain';

const mockMutateAsync = jest.fn(() => Promise.resolve());

jest.mock('@hooks/useModeration', () => ({
  useModerateReview: () => ({ mutateAsync: mockMutateAsync }),
}));

const items = [{ review_id: 'r1' }, { review_id: 'r2' }] as ModerationItem[];

describe('useModerationDecisions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockMutateAsync.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  it('retire l’avis de la file puis envoie la décision après le délai', async () => {
    const { result } = await renderHook(() => useModerationDecisions(items));

    await act(async () => result.current.decide(items[0], 'remove'));
    expect(result.current.visibleItems.map((item) => item.review_id)).toEqual(['r2']);
    expect(mockMutateAsync).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(UNDO_DELAY_MS);
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({ reviewId: 'r1', decision: 'remove' });
  });

  it('renvoie une file vide tant que les données ne sont pas chargées', async () => {
    const { result } = await renderHook(() => useModerationDecisions(undefined));
    expect(result.current.visibleItems).toEqual([]);
  });
});
