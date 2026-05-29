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
import { createPersistenceCoordinator } from '../lib/daily/persistenceCoordinator';
import {
  notifyDailySaveFailed,
  notifyStreakSaveFailed,
} from '../lib/daily/saveFailureAlert';
import { usePlayStatePersistence } from '../lib/daily/playStatePersistence';

import { DEV_TOOLS_ENABLED } from '../constants/dev';
import { formatStreakLine } from '../lib/copy/streak';
import { getLocalDateKey } from '../lib/date/localDay';
import { useI18n } from '../lib/i18n';
import { applyCheckIn, getStreakDisplay } from '../lib/streak/streakLogic';
import {
  needsStreakReconcile,
  reconcileStreakForCompletedDay,
} from '../lib/streak/reconcileStreak';
import type { StreakState } from '../lib/streak/types';
import { createEmptyGrid as createEmptyBinaryGrid } from '../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../lib/puzzles/nonogram/grid';
import { createEmptyGrid as createEmptySudokuGrid } from '../lib/puzzles/sudoku/grid';
import type {
  DailySnapshot,
  DailyStatus,
  GameType,
  PlayState,
  PuzzlePayload,
} from '../lib/puzzles/types';
import { isBinaryPuzzle, isNonogramPuzzle, isSudokuPuzzle } from '../lib/puzzles/types';
import { recordCompletion } from '../lib/storage/completionHistoryStorage';
import { incrementRatingCompletedCount } from '../lib/storage/ratingStorage';
import { clearDailySnapshot } from '../lib/storage/dailyStorage';
import { loadStreakState, saveStreakState } from '../lib/storage/streakStorage';
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
  streakSaveError: boolean;
  /** 游戏页连签副文案（通关计连签） */
  streakLine: string;
  /** 今日已通关入账时顶栏连签高亮 */
  streakHighlight: boolean;
  /** 连签展示天数（结果页战报等） */
  displayStreak: number;
  updatePlayState: (next: PlayState) => void;
  markCompleted: () => Promise<void>;
  markAbandoned: () => Promise<void>;
  refresh: () => Promise<void>;
  retrySave: () => Promise<void>;
  retryStreakSave: () => Promise<void>;
  /** 仅 __DEV__：清除并重新生成今日题目 */
  devRegenerateToday: (forceGameType?: GameType | null) => Promise<void>;
};

const DailyGameContext = createContext<DailyGameState | null>(null);

function useDailyGameProviderValue(): DailyGameState {
  const { locale } = useI18n();
  const [status, setStatus] = useState<HydrateStatus>('loading');
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [streakSaveError, setStreakSaveError] = useState(false);
  const hydratingRef = useRef(false);
  const coordinatorRef = useRef(createPersistenceCoordinator());
  const pendingStreakRef = useRef<StreakState | null>(null);
  const snapshotRef = useRef<DailySnapshot | null>(null);
  const streakRef = useRef<StreakState | null>(null);

  snapshotRef.current = snapshot;
  streakRef.current = streak;

  const retrySaveRef = useRef<() => Promise<void>>(async () => {});
  const retryStreakSaveRef = useRef<() => Promise<void>>(async () => {});

  const handleSaveFailed = useCallback(() => {
    setSaveError(true);
    notifyDailySaveFailed(() => {
      void retrySaveRef.current();
    }, locale);
  }, [locale]);

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

  const flushPlayStateRef = useRef(flushPlayState);
  flushPlayStateRef.current = flushPlayState;

  const retrySave = useCallback(async () => {
    if (snapshot == null) return;
    const current = drainPendingInto(snapshot);
    const { saved } = await persistSnapshot(current);
    if (saved) {
      setSaveError(false);
    }
  }, [snapshot, drainPendingInto, persistSnapshot]);

  retrySaveRef.current = retrySave;

  const persistStreakState = useCallback(async (next: StreakState) => {
    const saved = await saveStreakState(next);
    if (saved) {
      setStreak(next);
      setStreakSaveError(false);
      pendingStreakRef.current = null;
      return true;
    }

    pendingStreakRef.current = next;
    setStreakSaveError(true);
    notifyStreakSaveFailed(() => {
      void retryStreakSaveRef.current();
    }, locale);
    return false;
  }, [locale]);

  const retryStreakSave = useCallback(async () => {
    const pending = pendingStreakRef.current;
    if (pending == null) return;

    await coordinatorRef.current.enqueue(async () => {
      await persistStreakState(pending);
    });
  }, [persistStreakState]);

  retryStreakSaveRef.current = retryStreakSave;

  const loadHydratedState = useCallback(async () => {
    const [next, loadedStreak] = await Promise.all([
      hydrateDailyGame({ onSaveFailed: handleSaveFailed }),
      loadStreakState(),
    ]);

    let streakState = loadedStreak;

    if (needsStreakReconcile(next, loadedStreak)) {
      const reconciled = reconcileStreakForCompletedDay(next, loadedStreak);
      const saved = await saveStreakState(reconciled);
      if (saved) {
        streakState = reconciled;
      } else {
        pendingStreakRef.current = reconciled;
        setStreakSaveError(true);
      }
    }

    if (next.status === 'completed') {
      const startedAt = next.startedAt ?? Date.now();
      const finishedAt = next.finishedAt ?? Date.now();
      await recordCompletion(next.dateKey, finishedAt - startedAt);
    }

    setSnapshot(next);
    setStatus(next.status);
    setStreak(streakState);
  }, [handleSaveFailed]);

  const loadHydratedStateRef = useRef(loadHydratedState);
  loadHydratedStateRef.current = loadHydratedState;

  const hydrateCore = useCallback(async () => {
    if (hydratingRef.current) return;
    hydratingRef.current = true;
    setStatus('loading');

    try {
      await flushPlayStateRef.current();
      await loadHydratedStateRef.current();
    } finally {
      hydratingRef.current = false;
    }
  }, []);

  const hydrate = useCallback(
    () => coordinatorRef.current.enqueue(() => hydrateCore()),
    [hydrateCore],
  );

  const devRegenerateToday = useCallback(
    async (forceGameType?: GameType | null) => {
      if (!DEV_TOOLS_ENABLED) return;

      await coordinatorRef.current.enqueue(async () => {
        resetPending();

        const today = getLocalDateKey();
        const previous = snapshotRef.current;
        await clearDailySnapshot();

        const next = await buildNewDailySnapshot({
          today,
          previous,
          forceGameType,
          onSaveFailed: handleSaveFailed,
        });
        setSnapshot(next);
        setStatus(next.status);
      });
    },
    [resetPending, handleSaveFailed],
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        void flushPlayStateRef.current();
        return;
      }
      if (next === 'active') {
        void hydrate();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [hydrate]);

  const recordStreakCheckIn = useCallback(
    async (todayKey: string) => {
      const next = applyCheckIn(streakRef.current, todayKey);
      await persistStreakState(next);
    },
    [persistStreakState],
  );

  const persistStatus = useCallback(
    async (nextStatus: DailyStatus) => {
      if (snapshotRef.current == null) return;

      await coordinatorRef.current.enqueue(async () => {
        await flushPlayStateRef.current();

        const base = snapshotRef.current;
        if (base == null) return;

        const current = drainPendingInto(base);
        const updated: DailySnapshot = {
          ...current,
          status: nextStatus,
          finishedAt: Date.now(),
        };
        const { saved } = await persistSnapshot(updated);
        if (saved) {
          setStatus(nextStatus);
          setSaveError(false);
          if (nextStatus === 'completed') {
            const startedAt = updated.startedAt ?? Date.now();
            const finishedAt = updated.finishedAt ?? Date.now();
            await recordCompletion(updated.dateKey, finishedAt - startedAt);
            await recordStreakCheckIn(updated.dateKey);
            await incrementRatingCompletedCount();
          }
        }
      });
    },
    [
      drainPendingInto,
      persistSnapshot,
      recordStreakCheckIn,
    ],
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
    if (snapshot.status !== 'playing') {
      return snapshot.playState ?? null;
    }
    if (snapshot.gameType === 'sudoku' && isSudokuPuzzle(snapshot.puzzle)) {
      return snapshot.playState ?? createEmptySudokuGrid();
    }
    if (snapshot.gameType === 'binary' && isBinaryPuzzle(snapshot.puzzle)) {
      return snapshot.playState ?? createEmptyBinaryGrid();
    }
    if (snapshot.gameType === 'nonogram' && isNonogramPuzzle(snapshot.puzzle)) {
      return snapshot.playState ?? createEmptyNonogramGrid();
    }
    return null;
  }, [snapshot]);

  const streakDisplay = useMemo(() => {
    const todayKey = snapshot?.dateKey ?? getLocalDateKey();
    return getStreakDisplay(streak, todayKey);
  }, [streak, snapshot?.dateKey]);

  const streakLine = useMemo(
    () => formatStreakLine(streakDisplay, locale),
    [streakDisplay, locale],
  );

  const streakHighlight = streakDisplay.checkedInToday;
  const displayStreak = streakDisplay.displayStreak;

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
      streakSaveError,
      streakLine,
      streakHighlight,
      displayStreak,
      updatePlayState,
      markCompleted,
      markAbandoned,
      refresh: hydrate,
      retrySave,
      retryStreakSave,
      devRegenerateToday,
    }),
    [
      status,
      snapshot,
      puzzle,
      playState,
      saveError,
      streakSaveError,
      streakLine,
      streakHighlight,
      displayStreak,
      updatePlayState,
      markCompleted,
      markAbandoned,
      hydrate,
      retrySave,
      retryStreakSave,
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
