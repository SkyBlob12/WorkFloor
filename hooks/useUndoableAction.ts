import { useCallback, useEffect, useRef, useState } from 'react';

import { showUndoToast } from '@lib/toast';
import { logger } from '@utils/logger';

export interface UndoableActionOptions {
  id: string;
  message: string;
  undoLabel: string;
  commit: () => Promise<unknown>;
}

export interface UndoableActionController {
  /** Éléments masqués en attendant l'exécution (ou l'annulation). */
  pendingIds: ReadonlySet<string>;
  schedule: (options: UndoableActionOptions) => void;
}

interface PendingEntry {
  timer: ReturnType<typeof setTimeout>;
  commit: () => Promise<unknown>;
}

function without(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set);
  next.delete(id);
  return next;
}

/**
 * Action différée avec snackbar « Annuler » : l'élément disparaît tout de suite,
 * l'action n'est envoyée qu'après le délai. En quittant l'écran, les actions en attente partent.
 */
export function useUndoableAction(delayMs: number): UndoableActionController {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set());
  const entries = useRef(new Map<string, PendingEntry>());

  const commitNow = useCallback(async (id: string) => {
    const entry = entries.current.get(id);
    if (!entry) return;
    entries.current.delete(id);
    try {
      await entry.commit();
    } catch (error) {
      logger.error(error);
    } finally {
      setPendingIds((current) => without(current, id));
    }
  }, []);

  const cancel = useCallback((id: string) => {
    const entry = entries.current.get(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    entries.current.delete(id);
    setPendingIds((current) => without(current, id));
  }, []);

  const schedule = useCallback(
    ({ id, message, undoLabel, commit }: UndoableActionOptions) => {
      if (entries.current.has(id)) return;
      const timer = setTimeout(() => void commitNow(id), delayMs);
      entries.current.set(id, { timer, commit });
      setPendingIds((current) => new Set(current).add(id));
      showUndoToast({ message, undoLabel, durationMs: delayMs, onUndo: () => cancel(id) });
    },
    [delayMs, commitNow, cancel],
  );

  useEffect(() => {
    const pending = entries.current;
    return () => {
      for (const entry of pending.values()) {
        clearTimeout(entry.timer);
        entry.commit().catch((error: unknown) => logger.error(error));
      }
      pending.clear();
    };
  }, []);

  return { pendingIds, schedule };
}
