import { useCallback, useEffect, useRef } from 'react';

import { PLAY_STATE_DEBOUNCE_MS } from '../../constants/config';
import type { DailySnapshot, PlayState } from '../puzzles/types';
import { saveDailySnapshot } from '../storage/dailyStorage';

export type SaveSnapshotResult = {
  saved: boolean;
  snapshot: DailySnapshot;
};

export type UsePlayStatePersistenceParams = {
  snapshot: DailySnapshot | null;
  setSnapshot: (next: DailySnapshot | null) => void;
  onSaveFailed?: () => void;
};

export function usePlayStatePersistence({
  snapshot,
  setSnapshot,
  onSaveFailed,
}: UsePlayStatePersistenceParams) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPlayStateRef = useRef<PlayState | null>(null);

  const clearDebounce = useCallback(() => {
    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const flushPlayState = useCallback(async () => {
    clearDebounce();
    if (snapshot == null || pendingPlayStateRef.current == null) return;

    const nextPlayState = pendingPlayStateRef.current;
    pendingPlayStateRef.current = null;

    const updated: DailySnapshot = {
      ...snapshot,
      playState: nextPlayState,
    };
    const saved = await saveDailySnapshot(updated);
    if (saved) {
      setSnapshot(updated);
    } else {
      setSnapshot(snapshot);
      pendingPlayStateRef.current = nextPlayState;
      onSaveFailed?.();
    }
  }, [snapshot, setSnapshot, clearDebounce, onSaveFailed]);

  const updatePlayState = useCallback(
    (next: PlayState) => {
      if (snapshot == null) return;

      pendingPlayStateRef.current = next;
      const optimistic: DailySnapshot = { ...snapshot, playState: next };
      setSnapshot(optimistic);

      clearDebounce();
      debounceRef.current = setTimeout(() => {
        void flushPlayState();
      }, PLAY_STATE_DEBOUNCE_MS);
    },
    [snapshot, setSnapshot, clearDebounce, flushPlayState],
  );

  const drainPendingInto = useCallback(
    (base: DailySnapshot): DailySnapshot => {
      if (pendingPlayStateRef.current == null) return base;
      const merged = { ...base, playState: pendingPlayStateRef.current };
      pendingPlayStateRef.current = null;
      return merged;
    },
    [],
  );

  const persistSnapshot = useCallback(
    async (next: DailySnapshot): Promise<SaveSnapshotResult> => {
      clearDebounce();
      const saved = await saveDailySnapshot(next);
      setSnapshot(next);
      if (!saved) {
        onSaveFailed?.();
      }
      return { saved, snapshot: next };
    },
    [setSnapshot, clearDebounce, onSaveFailed],
  );

  const resetPending = useCallback(() => {
    clearDebounce();
    pendingPlayStateRef.current = null;
  }, [clearDebounce]);

  useEffect(
    () => () => {
      clearDebounce();
    },
    [clearDebounce],
  );

  return {
    updatePlayState,
    flushPlayState,
    drainPendingInto,
    persistSnapshot,
    resetPending,
    clearDebounce,
  };
}
