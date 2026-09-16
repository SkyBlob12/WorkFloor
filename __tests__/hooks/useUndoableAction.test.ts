import { act, renderHook } from '@testing-library/react-native';

import { useUndoableAction } from '@hooks/useUndoableAction';
import { showUndoToast } from '@lib/toast';

const showUndoToastMock = jest.mocked(showUndoToast);

function options(commit: () => Promise<unknown>) {
  return { id: 'review-1', message: 'Supprimé', undoLabel: 'Annuler', commit };
}

describe('useUndoableAction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    showUndoToastMock.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  it('masque l’élément puis exécute l’action après le délai', async () => {
    const commit = jest.fn(() => Promise.resolve());
    const { result } = await renderHook(() => useUndoableAction(3000));

    await act(async () => result.current.schedule(options(commit)));
    expect(result.current.pendingIds.has('review-1')).toBe(true);
    expect(showUndoToastMock).toHaveBeenCalledWith(expect.objectContaining({ durationMs: 3000 }));
    expect(commit).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(result.current.pendingIds.has('review-1')).toBe(false);
  });

  it('annule l’action via le toast', async () => {
    const commit = jest.fn(() => Promise.resolve());
    const { result } = await renderHook(() => useUndoableAction(3000));

    await act(async () => result.current.schedule(options(commit)));
    await act(async () => showUndoToastMock.mock.calls[0][0].onUndo());
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(commit).not.toHaveBeenCalled();
    expect(result.current.pendingIds.size).toBe(0);
  });

  it('exécute les actions en attente quand l’écran est quitté', async () => {
    const commit = jest.fn(() => Promise.resolve());
    const { result, unmount } = await renderHook(() => useUndoableAction(3000));

    await act(async () => result.current.schedule(options(commit)));
    await unmount();

    expect(commit).toHaveBeenCalledTimes(1);
  });
});
