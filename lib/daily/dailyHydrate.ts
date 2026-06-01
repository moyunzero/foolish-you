import { STORAGE_VERSION } from '../../constants/config';
import { getDevForceGameType } from '../../constants/dev';
import { getLocalDateKey } from '../date/localDay';
import { createEmptyGrid as createEmptyBinaryGrid } from '../puzzles/binary/grid';
import { selectDailyGame, type SelectDailyGameParams } from '../puzzles/dailySelector';
import { selectDailyGameSafe } from '../puzzles/dailySelectorSafe';
import { createEmptyGrid as createEmptyNonogramGrid } from '../puzzles/nonogram/grid';
import { createEmptyPlayState as createEmptySlitherlinkPlayState } from '../puzzles/slitherlink/edges';
import { createEmptyGrid as createEmptySudokuGrid } from '../puzzles/sudoku/grid';
import type { DailySnapshot, GameType } from '../puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from '../puzzles/types';
import { runAfterInteractions } from '../platform/runAfterInteractions';
import {
  loadDailySnapshot,
  saveDailySnapshot,
} from '../storage/dailyStorage';
import { prepareTodaySnapshot } from '../storage/snapshotPrep';

export type BuildNewDailyParams = {
  today: string;
  previous: DailySnapshot | null;
  forceGameType?: GameType | null;
  /** Dev「重开今日」：保持当前题型，仅换题（仍避开上一道 puzzleHash） */
  devKeepGameType?: boolean;
  onSaveFailed?: () => void;
};

export type HydrateDailyParams = {
  today?: string;
  forceGameType?: GameType | null;
  onSaveFailed?: () => void;
};

function resolveForceGameType(
  explicit?: GameType | null,
): GameType | undefined {
  if (explicit === null) return undefined;
  if (explicit != null) return explicit;
  return getDevForceGameType() ?? undefined;
}

function ensurePlayStateForSnapshot(snapshot: DailySnapshot): DailySnapshot {
  if (snapshot.status !== 'playing') {
    return snapshot;
  }
  if (
    snapshot.gameType === 'sudoku' &&
    isSudokuPuzzle(snapshot.puzzle) &&
    snapshot.playState == null
  ) {
    return { ...snapshot, playState: createEmptySudokuGrid() };
  }
  if (
    snapshot.gameType === 'binary' &&
    isBinaryPuzzle(snapshot.puzzle) &&
    snapshot.playState == null
  ) {
    return { ...snapshot, playState: createEmptyBinaryGrid() };
  }
  if (
    snapshot.gameType === 'nonogram' &&
    isNonogramPuzzle(snapshot.puzzle) &&
    snapshot.playState == null
  ) {
    return { ...snapshot, playState: createEmptyNonogramGrid() };
  }
  if (
    snapshot.gameType === 'slitherlink' &&
    isSlitherlinkPuzzle(snapshot.puzzle) &&
    snapshot.playState == null
  ) {
    return { ...snapshot, playState: createEmptySlitherlinkPlayState() };
  }
  return snapshot;
}

function emptyPlayStateForGameType(gameType: GameType) {
  if (gameType === 'sudoku') return createEmptySudokuGrid();
  if (gameType === 'binary') return createEmptyBinaryGrid();
  if (gameType === 'nonogram') return createEmptyNonogramGrid();
  return createEmptySlitherlinkPlayState();
}

function buildSelectPrevious(
  params: BuildNewDailyParams,
  forced: GameType | undefined,
): SelectDailyGameParams['previous'] {
  if (params.previous == null) return undefined;

  if (params.devKeepGameType || forced != null) {
    return params.previous.puzzleHash
      ? { puzzleHash: params.previous.puzzleHash }
      : undefined;
  }

  return {
    gameType: params.previous.gameType,
    puzzleHash: params.previous.puzzleHash,
  };
}

export async function buildNewDailySnapshot(
  params: BuildNewDailyParams,
): Promise<DailySnapshot> {
  const forced =
    params.devKeepGameType && params.previous
      ? params.previous.gameType
      : resolveForceGameType(params.forceGameType);
  const selected = selectDailyGameSafe({
    dateKey: params.today,
    previous: buildSelectPrevious(params, forced),
    forceGameType: forced,
  });

  const now = Date.now();
  const snapshot: DailySnapshot = {
    version: STORAGE_VERSION,
    dateKey: params.today,
    gameType: selected.gameType,
    seed: selected.seed,
    status: 'playing',
    puzzle: selected.puzzle,
    puzzleHash: selected.puzzleHash,
    playState: emptyPlayStateForGameType(selected.gameType),
    startedAt: now,
    lastGameType: params.previous?.gameType,
    lastPuzzleHash: params.previous?.puzzleHash,
  };

  const saved = await saveDailySnapshot(snapshot);
  if (!saved) {
    params.onSaveFailed?.();
  }
  return snapshot;
}

/** Load or create today's snapshot (pure orchestration — no React). */
export async function hydrateDailyGame(
  params: HydrateDailyParams = {},
): Promise<DailySnapshot> {
  const today = params.today ?? getLocalDateKey();
  const record = await loadDailySnapshot();

  if (record != null && record.dateKey === today) {
    let prepared = await runAfterInteractions(() =>
      prepareTodaySnapshot(record),
    );
    prepared = ensurePlayStateForSnapshot(prepared);
    const saved = await saveDailySnapshot(prepared);
    if (!saved) {
      params.onSaveFailed?.();
    }
    return prepared;
  }

  return runAfterInteractions(() =>
    buildNewDailySnapshot({
      today,
      previous: record,
      forceGameType: params.forceGameType ?? getDevForceGameType(),
      onSaveFailed: params.onSaveFailed,
    }),
  );
}
