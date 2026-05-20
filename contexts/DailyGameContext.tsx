import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  buildNewDailySnapshot,
  hydrateDailyGame,
} from '../lib/daily/dailyHydrate';
import { notifyDailySaveFailed } from '../lib/daily/saveFailureAlert';
import { usePlayStatePersistence } from '../lib/daily/playStatePersistence';

import { DEV_TOOLS_ENABLED } from '../constants/dev';
import { getLocalDateKey } from '../lib/date/localDay';
import { createEmptyGrid as createEmptyBinaryGrid } from '../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptySudokuGrid } from '../lib/puzzles/sudoku/grid';
import type {
  DailySnapshot,
  DailyStatus,
  GameType,
  PlayState,
  PuzzlePayload,
} from '../lib/puzzles/types';
import { isBinaryPuzzle, isSudokuPuzzle } from '../lib/puzzles/types';
import { clearDailySnapshot } from '../lib/storage/dailyStorage';
import { isSnapshotPuzzleConsistent } from '../lib/storage/snapshotValidate';

export type HydrateStatus = 'loading' | DailyStatus;

export type DailyGameState = {
  status: HydrateStatus;
  dateKey: string | null;
  gameType: GameType | null;
  seed: number | null;
  snapshot: DailySnapshot | null;
  puzzle: PuzzlePayload | null;
  playState: PlayState | null;
  saveError: boolean;
  updatePlayState: (next: PlayState) => void;
  markCompleted: () => Promise<void>;
  markAbandoned: () => Promise<void>;
  refresh: () => Promise<void>;
  retrySave: () => Promise<void>;
  /** 仅 __DEV__：清除并重新生成今日题目 */
  devRegenerateToday: (forceGameType?: GameType | null) => Promise<void>;
};

const DailyGameContext = createContext<DailyGameState | null>(null);

function useDailyGameProviderValue(): DailyGameState {
  const [status, setStatus] = useState<HydrateStatus>('loading');
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [saveError, setSaveError] = useState(false);
  const hydratingRef = useRef(false);

  const retrySaveRef = useRef<() => Promise<void>>(async () => {});

  const handleSaveFailed = useCallback(() => {
    setSaveError(true);
    notifyDailySaveFailed(() => {
      void retrySaveRef.current();
    });
  }, []);

  const {
    updatePlayState,
    flushPlayState,
    drainPendingInto,
    persistSnapshot,
    resetPending,
  } = usePlayStatePersistence({
    snapshot,
    setSnapshot,
    onSaveFailed: handleSaveFailed,
  });

  const retrySave = useCallback(async () => {
    if (snapshot == null) return;
    const current = drainPendingInto(snapshot);
    const { saved } = await persistSnapshot(current);
    if (saved) {
      setSaveError(false);
    }
  }, [snapshot, drainPendingInto, persistSnapshot]);

  retrySaveRef.current = retrySave;

  const hydrate = useCallback(async () => {
    if (hydratingRef.current) return;
    hydratingRef.current = true;
    setStatus('loading');

    try {
      const next = await hydrateDailyGame({ onSaveFailed: handleSaveFailed });
      setSnapshot(next);
      setStatus(next.status);
    } finally {
      hydratingRef.current = false;
    }
  }, [handleSaveFailed]);

  const devRegenerateToday = useCallback(
    async (forceGameType?: GameType | null) => {
      if (!DEV_TOOLS_ENABLED) return;

      resetPending();

      const today = getLocalDateKey();
      const previous = snapshot;
      await clearDailySnapshot();

      const next = await buildNewDailySnapshot({
        today,
        previous,
        forceGameType,
        onSaveFailed: handleSaveFailed,
      });
      setSnapshot(next);
      setStatus(next.status);
    },
    [snapshot, resetPending, handleSaveFailed],
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        void flushPlayState();
        return;
      }
      if (next === 'active') {
        void hydrate();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [hydrate, flushPlayState]);

  const persistStatus = useCallback(
    async (nextStatus: DailyStatus) => {
      if (snapshot == null) return;

      const current = drainPendingInto(snapshot);
      const updated: DailySnapshot = {
        ...current,
        status: nextStatus,
        finishedAt: Date.now(),
      };
      const { saved } = await persistSnapshot(updated);
      if (saved) {
        setStatus(nextStatus);
        setSaveError(false);
      }
    },
    [snapshot, drainPendingInto, persistSnapshot],
  );

  const markCompleted = useCallback(
    () => persistStatus('completed'),
    [persistStatus],
  );

  const markAbandoned = useCallback(
    () => persistStatus('abandoned'),
    [persistStatus],
  );

  const puzzle: PuzzlePayload | null =
    snapshot != null && isSnapshotPuzzleConsistent(snapshot)
      ? snapshot.puzzle
      : null;

  const playState = useMemo((): PlayState | null => {
    if (snapshot == null) return null;
    if (snapshot.gameType === 'sudoku' && isSudokuPuzzle(snapshot.puzzle)) {
      return snapshot.playState ?? createEmptySudokuGrid();
    }
    if (snapshot.gameType === 'binary' && isBinaryPuzzle(snapshot.puzzle)) {
      return snapshot.playState ?? createEmptyBinaryGrid();
    }
    return null;
  }, [snapshot]);

  return useMemo(
    () => ({
      status,
      dateKey: snapshot?.dateKey ?? null,
      gameType: snapshot?.gameType ?? null,
      seed: snapshot?.seed ?? null,
      snapshot,
      puzzle,
      playState,
      saveError,
      updatePlayState,
      markCompleted,
      markAbandoned,
      refresh: hydrate,
      retrySave,
      devRegenerateToday,
    }),
    [
      status,
      snapshot,
      puzzle,
      playState,
      saveError,
      updatePlayState,
      markCompleted,
      markAbandoned,
      hydrate,
      retrySave,
      devRegenerateToday,
    ],
  );
}

export function DailyGameProvider({ children }: { children: ReactNode }) {
  const value = useDailyGameProviderValue();
  return (
    <DailyGameContext.Provider value={value}>
      {children}
    </DailyGameContext.Provider>
  );
}

export function useDailyGame(): DailyGameState {
  const ctx = useContext(DailyGameContext);
  if (ctx == null) {
    throw new Error('useDailyGame must be used within DailyGameProvider');
  }
  return ctx;
}
