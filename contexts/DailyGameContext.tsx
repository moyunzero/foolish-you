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

import { PLAY_STATE_DEBOUNCE_MS, STORAGE_VERSION } from '../constants/config';
import { DEV_TOOLS_ENABLED, getDevForceGameType } from '../constants/dev';
import { getLocalDateKey } from '../lib/date/localDay';
import { generateBinaryPuzzle } from '../lib/puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../lib/puzzles/binary/grid';
import { selectDailyGame } from '../lib/puzzles/dailySelector';
import { deriveSubSeed } from '../lib/puzzles/rng';
import { generateSudokuPuzzle } from '../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../lib/puzzles/sudoku/grid';
import type {
  DailySnapshot,
  DailyStatus,
  GameType,
  PlayState,
  PuzzlePayload,
} from '../lib/puzzles/types';
import { isBinaryPuzzle, isBinaryPuzzleStub, isSudokuPuzzle } from '../lib/puzzles/types';
import {
  clearDailySnapshot,
  loadDailySnapshot,
  saveDailySnapshot,
} from '../lib/storage/dailyStorage';

export type HydrateStatus = 'loading' | DailyStatus;

export type DailyGameState = {
  status: HydrateStatus;
  dateKey: string | null;
  gameType: GameType | null;
  seed: number | null;
  snapshot: DailySnapshot | null;
  puzzle: PuzzlePayload | null;
  playState: PlayState | null;
  updatePlayState: (next: PlayState) => void;
  markCompleted: () => Promise<void>;
  markAbandoned: () => Promise<void>;
  refresh: () => Promise<void>;
  /** 仅 __DEV__：清除并重新生成今日题目 */
  devRegenerateToday: (forceGameType?: GameType | null) => Promise<void>;
};

const DailyGameContext = createContext<DailyGameState | null>(null);

function sudokuPuzzleFromSeed(seed: number): PuzzlePayload {
  return generateSudokuPuzzle(deriveSubSeed(seed, 'migrate'));
}

function binaryPuzzleFromSeed(seed: number): PuzzlePayload {
  return generateBinaryPuzzle(deriveSubSeed(seed, 'binary-migrate'));
}

function migrateLegacySnapshot(record: DailySnapshot): DailySnapshot {
  if (record.puzzleStub?.placeholder) {
    if (record.gameType === 'sudoku') {
      const puzzle = sudokuPuzzleFromSeed(record.seed);
      return {
        ...record,
        puzzle,
        puzzleHash: puzzle.puzzleHash,
        playState: record.playState ?? createEmptySudokuGrid(),
        puzzleStub: undefined,
      };
    }
    const puzzle = binaryPuzzleFromSeed(record.seed);
    return {
      ...record,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: record.playState ?? createEmptyBinaryGrid(),
      puzzleStub: undefined,
    };
  }

  if (record.puzzle != null && isBinaryPuzzleStub(record.puzzle)) {
    const puzzle = binaryPuzzleFromSeed(record.seed);
    return {
      ...record,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: record.playState ?? createEmptyBinaryGrid(),
    };
  }

  return record;
}

function resolveForceGameType(
  explicit?: GameType | null,
): GameType | undefined {
  if (explicit === null) return undefined;
  if (explicit != null) return explicit;
  const fromConfig = getDevForceGameType();
  return fromConfig ?? undefined;
}

async function buildNewDaily(
  today: string,
  previous: DailySnapshot | null,
  forceGameType?: GameType | null,
): Promise<DailySnapshot> {
  const forced = resolveForceGameType(forceGameType);
  const selected = selectDailyGame({
    dateKey: today,
    previous:
      forced == null && previous
        ? { gameType: previous.gameType, puzzleHash: previous.puzzleHash }
        : undefined,
    forceGameType: forced,
  });

  const now = Date.now();
  const snapshot: DailySnapshot = {
    version: STORAGE_VERSION,
    dateKey: today,
    gameType: selected.gameType,
    seed: selected.seed,
    status: 'playing',
    puzzle: selected.puzzle,
    puzzleHash: selected.puzzleHash,
    playState:
      selected.gameType === 'sudoku'
        ? createEmptySudokuGrid()
        : createEmptyBinaryGrid(),
    startedAt: now,
    lastGameType: previous?.gameType,
    lastPuzzleHash: previous?.puzzleHash,
  };

  await saveDailySnapshot(snapshot);
  return snapshot;
}

function useDailyGameProviderValue(): DailyGameState {
  const [status, setStatus] = useState<HydrateStatus>('loading');
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const hydratingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPlayStateRef = useRef<PlayState | null>(null);

  const flushPlayState = useCallback(async () => {
    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (snapshot == null || pendingPlayStateRef.current == null) return;

    const nextPlayState = pendingPlayStateRef.current;
    pendingPlayStateRef.current = null;

    const updated: DailySnapshot = {
      ...snapshot,
      playState: nextPlayState,
    };
    await saveDailySnapshot(updated);
    setSnapshot(updated);
  }, [snapshot]);

  const hydrate = useCallback(async () => {
    if (hydratingRef.current) return;
    hydratingRef.current = true;
    setStatus('loading');

    try {
      const today = getLocalDateKey();
      let record = await loadDailySnapshot();

      if (record != null && record.dateKey === today) {
        record = migrateLegacySnapshot(record);
        if (record.puzzleStub != null || record.puzzle == null) {
          record = migrateLegacySnapshot(record);
        }
        if (
          record.gameType === 'sudoku' &&
          isSudokuPuzzle(record.puzzle) &&
          record.playState == null
        ) {
          record = { ...record, playState: createEmptySudokuGrid() };
          await saveDailySnapshot(record);
        }
        if (
          record.gameType === 'binary' &&
          isBinaryPuzzle(record.puzzle) &&
          record.playState == null
        ) {
          record = { ...record, playState: createEmptyBinaryGrid() };
          await saveDailySnapshot(record);
        }
        setSnapshot(record);
        setStatus(record.status);
        return;
      }

      const next = await buildNewDaily(today, record, getDevForceGameType());
      setSnapshot(next);
      setStatus(next.status);
    } finally {
      hydratingRef.current = false;
    }
  }, []);

  const devRegenerateToday = useCallback(
    async (forceGameType?: GameType | null) => {
      if (!DEV_TOOLS_ENABLED) return;

      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      pendingPlayStateRef.current = null;

      const today = getLocalDateKey();
      const previous = snapshot;
      await clearDailySnapshot();

      const next = await buildNewDaily(today, previous, forceGameType);
      setSnapshot(next);
      setStatus(next.status);
    },
    [snapshot],
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        void hydrate();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [hydrate]);

  useEffect(
    () => () => {
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  const updatePlayState = useCallback(
    (next: PlayState) => {
      if (snapshot == null) return;

      pendingPlayStateRef.current = next;
      const optimistic: DailySnapshot = { ...snapshot, playState: next };
      setSnapshot(optimistic);

      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        void flushPlayState();
      }, PLAY_STATE_DEBOUNCE_MS);
    },
    [snapshot, flushPlayState],
  );

  const persistStatus = useCallback(
    async (nextStatus: DailyStatus) => {
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (snapshot == null) return;

      let current = snapshot;
      if (pendingPlayStateRef.current != null) {
        current = { ...current, playState: pendingPlayStateRef.current };
        pendingPlayStateRef.current = null;
      }

      const updated: DailySnapshot = {
        ...current,
        status: nextStatus,
        finishedAt: Date.now(),
      };
      await saveDailySnapshot(updated);
      setSnapshot(updated);
      setStatus(nextStatus);
    },
    [snapshot],
  );

  const markCompleted = useCallback(
    () => persistStatus('completed'),
    [persistStatus],
  );

  const markAbandoned = useCallback(
    () => persistStatus('abandoned'),
    [persistStatus],
  );

  const puzzle =
    snapshot?.puzzle ??
    (snapshot?.puzzleStub != null
      ? ({ kind: snapshot.gameType, placeholder: true } as PuzzlePayload)
      : null);

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
      updatePlayState,
      markCompleted,
      markAbandoned,
      refresh: hydrate,
      devRegenerateToday,
    }),
    [
      status,
      snapshot,
      puzzle,
      playState,
      updatePlayState,
      markCompleted,
      markAbandoned,
      hydrate,
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
