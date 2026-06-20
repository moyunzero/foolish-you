import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { solveFirstGrid } from '../puzzles/binary/solver';
import {
  cloneGrid as cloneBinaryGrid,
  createEmptyGrid as createEmptyBinaryGrid,
} from '../puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../puzzles/nonogram/grid';
import { NONOGRAM_CROSS, NONOGRAM_FILL } from '../puzzles/nonogram/spec';
import { clonePlayState, createEmptyPlayState as createEmptySlitherlinkPlayState } from '../puzzles/slitherlink/edges';
import {
  createEmptyGrid as createEmptySudokuGrid,
  mergePlayAndGivens,
} from '../puzzles/sudoku/grid';
import { solveInPlace as solveSudokuInPlace } from '../puzzles/sudoku/solver';
import type { DailySnapshot, PlayState } from '../puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from '../puzzles/types';
import { recordCompletion } from '../storage/completionHistoryStorage';
import { loadDailySnapshot, saveDailySnapshot } from '../storage/dailyStorage';

function emptyPlayStateFor(snapshot: DailySnapshot) {
  if (snapshot.gameType === 'sudoku') return createEmptySudokuGrid();
  if (snapshot.gameType === 'binary') return createEmptyBinaryGrid();
  if (snapshot.gameType === 'nonogram') return createEmptyNonogramGrid();
  return createEmptySlitherlinkPlayState();
}

function solvedPlayStateFor(snapshot: DailySnapshot): PlayState | null {
  const { puzzle } = snapshot;
  if (isSudokuPuzzle(puzzle)) {
    const merged = mergePlayAndGivens(puzzle.givens, createEmptySudokuGrid());
    const working = merged.map((row) => [...row]);
    if (!solveSudokuInPlace(working)) return null;
    return working;
  }
  if (isBinaryPuzzle(puzzle)) {
    return solveFirstGrid(cloneBinaryGrid(puzzle.givens));
  }
  if (isNonogramPuzzle(puzzle)) {
    return puzzle.solution.map((row) =>
      row.map((filled) => (filled ? NONOGRAM_FILL : NONOGRAM_CROSS)),
    );
  }
  if (isSlitherlinkPuzzle(puzzle)) {
    return clonePlayState(puzzle.solution);
  }
  return null;
}

/** __DEV__: status=completed but empty board → triggers recover on next load. */
export async function devInjectCompletedEmptyPlayState(): Promise<boolean> {
  if (!DEV_TOOLS_ENABLED) return false;
  const snapshot = await loadDailySnapshot();
  if (snapshot == null) return false;
  const saved = await saveDailySnapshot({
    ...snapshot,
    status: 'completed',
    playState: emptyPlayStateFor(snapshot),
    finishedAt: Date.now(),
  });
  return saved;
}

/** __DEV__: fill today's board with a valid solution and mark completed (Maestro / growth QA). */
export async function devInjectTodayCompleted(): Promise<boolean> {
  if (!DEV_TOOLS_ENABLED) return false;
  const snapshot = await loadDailySnapshot();
  if (snapshot == null || snapshot.status !== 'playing') return false;
  const playState = solvedPlayStateFor(snapshot);
  if (playState == null) return false;
  const finishedAt = Date.now();
  const saved = await saveDailySnapshot({
    ...snapshot,
    status: 'completed',
    playState,
    finishedAt,
  });
  if (!saved) return false;
  const startedAt = snapshot.startedAt ?? finishedAt;
  await recordCompletion(snapshot.dateKey, finishedAt - startedAt, snapshot.gameType);
  return true;
}
