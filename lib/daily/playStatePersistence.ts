import { useCallback, useEffect, useRef } from 'react';

import { PLAY_STATE_DEBOUNCE_MS } from '../../constants/config';
import type { DailySnapshot, PlayState, SudokuNotes } from '../puzzles/types';
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

/**
 * Apply pending notes ref onto a snapshot clone.
 * `undefined` = no pending notes change; `null` = clear sibling.
 */
function applyPendingNotes(
  base: DailySnapshot,
  pending: SudokuNotes | null | undefined,
): DailySnapshot {
  if (pending === undefined) return base;
  if (pending == null) {
    const { sudokuNotes: _omit, ...rest } = base;
    return rest;
  }
  return { ...base, sudokuNotes: pending };
}

export function usePlayStatePersistence({
  snapshot,
  setSnapshot,
  onSaveFailed,
}: UsePlayStatePersistenceParams) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPlayStateRef = useRef<PlayState | null>(null);
  /** undefined = unchanged; null = clear; grid = set (Pitfall 7). */
  const pendingSudokuNotesRef = useRef<SudokuNotes | null | undefined>(
    undefined,
  );
  /** Bumped on every optimistic edit so in-flight flush results cannot clobber newer state. */
  const editEpochRef = useRef(0);

  const clearDebounce = useCallback(() => {
    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const flushPlayState = useCallback(async () => {
    clearDebounce();
    if (snapshot == null) return;
    if (
      pendingPlayStateRef.current == null &&
      pendingSudokuNotesRef.current === undefined
    ) {
      return;
    }

    const epochAtStart = editEpochRef.current;
    const nextPlayState =
      pendingPlayStateRef.current ?? snapshot.playState ?? null;
    const pendingNotes = pendingSudokuNotesRef.current;
    pendingPlayStateRef.current = null;
    pendingSudokuNotesRef.current = undefined;

    let updated: DailySnapshot = { ...snapshot };
    if (nextPlayState != null) {
      updated = { ...updated, playState: nextPlayState };
    }
    updated = applyPendingNotes(updated, pendingNotes);

    const saved = await saveDailySnapshot(updated);
    if (editEpochRef.current !== epochAtStart) {
      // Newer optimistic edits already own snapshot + pending; do not roll back.
      if (!saved) {
        onSaveFailed?.();
      }
      return;
    }

    if (saved) {
      setSnapshot(updated);
    } else {
      setSnapshot(snapshot);
      if (nextPlayState != null) {
        pendingPlayStateRef.current = nextPlayState;
      }
      if (pendingNotes !== undefined) {
        pendingSudokuNotesRef.current = pendingNotes;
      }
      onSaveFailed?.();
    }
  }, [snapshot, setSnapshot, clearDebounce, onSaveFailed]);

  const scheduleFlush = useCallback(() => {
    clearDebounce();
    debounceRef.current = setTimeout(() => {
      void flushPlayState();
    }, PLAY_STATE_DEBOUNCE_MS);
  }, [clearDebounce, flushPlayState]);

  const updatePlayState = useCallback(
    (next: PlayState) => {
      if (snapshot == null) return;

      editEpochRef.current += 1;
      pendingPlayStateRef.current = next;
      let optimistic: DailySnapshot = { ...snapshot, playState: next };
      optimistic = applyPendingNotes(
        optimistic,
        pendingSudokuNotesRef.current,
      );
      setSnapshot(optimistic);
      scheduleFlush();
    },
    [snapshot, setSnapshot, scheduleFlush],
  );

  /** Sibling notes write — never nested in playState (D-06, D-22, Pitfall 7). */
  const updateSudokuNotes = useCallback(
    (next: SudokuNotes | null) => {
      if (snapshot == null) return;

      editEpochRef.current += 1;
      pendingSudokuNotesRef.current = next;
      let optimistic: DailySnapshot = { ...snapshot };
      if (pendingPlayStateRef.current != null) {
        optimistic = { ...optimistic, playState: pendingPlayStateRef.current };
      }
      optimistic = applyPendingNotes(optimistic, next);
      setSnapshot(optimistic);
      scheduleFlush();
    },
    [snapshot, setSnapshot, scheduleFlush],
  );

  const drainPendingInto = useCallback(
    (base: DailySnapshot): DailySnapshot => {
      let merged = base;
      if (pendingPlayStateRef.current != null) {
        merged = { ...merged, playState: pendingPlayStateRef.current };
        pendingPlayStateRef.current = null;
      }
      if (pendingSudokuNotesRef.current !== undefined) {
        merged = applyPendingNotes(merged, pendingSudokuNotesRef.current);
        pendingSudokuNotesRef.current = undefined;
      }
      return merged;
    },
    [],
  );

  const persistSnapshot = useCallback(
    async (next: DailySnapshot): Promise<SaveSnapshotResult> => {
      clearDebounce();
      const saved = await saveDailySnapshot(next);
      if (saved) {
        setSnapshot(next);
      } else {
        onSaveFailed?.();
      }
      return { saved, snapshot: saved ? next : snapshot! };
    },
    [snapshot, setSnapshot, clearDebounce, onSaveFailed],
  );

  const resetPending = useCallback(() => {
    clearDebounce();
    pendingPlayStateRef.current = null;
    pendingSudokuNotesRef.current = undefined;
  }, [clearDebounce]);

  useEffect(
    () => () => {
      clearDebounce();
    },
    [clearDebounce],
  );

  return {
    updatePlayState,
    updateSudokuNotes,
    flushPlayState,
    drainPendingInto,
    persistSnapshot,
    resetPending,
    clearDebounce,
  };
}
