import { isCompleteAndValid as isBinaryComplete } from '../puzzles/binary/validate';
import { BINARY_EMPTY, BINARY_ONE, BINARY_ZERO } from '../puzzles/binary/grid';
import { BINARY_SIZE } from '../puzzles/binary/spec';
import { isCompleteAndValid as isNonogramComplete } from '../puzzles/nonogram/validate';
import {
  NONOGRAM_COLS,
  NONOGRAM_EMPTY,
  NONOGRAM_FILL,
  NONOGRAM_ROWS,
} from '../puzzles/nonogram/spec';
import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type SlitherlinkPlayState,
} from '../puzzles/slitherlink/spec';
import { isCompleteAndValid as isSlitherlinkComplete } from '../puzzles/slitherlink/validate';
import { SUDOKU_SIZE } from '../puzzles/sudoku/grid';
import { isCompleteAndValid as isSudokuComplete } from '../puzzles/sudoku/validate';
import { STORAGE_VERSION } from '../../constants/config';
import type { DailySnapshot, GameType, NonogramPlayState } from '../puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from '../puzzles/types';
import type { PersistedSnapshot } from './snapshotLegacy';

function isSizedGrid(
  grid: unknown,
  size: number,
): grid is number[][] {
  if (!Array.isArray(grid) || grid.length !== size) return false;
  return grid.every(
    (row) =>
      Array.isArray(row) &&
      row.length === size &&
      row.every((cell) => typeof cell === 'number' && Number.isFinite(cell)),
  );
}

export function isValidSudokuGivens(givens: unknown): givens is number[][] {
  if (!isSizedGrid(givens, SUDOKU_SIZE)) return false;
  return givens.every((row) =>
    row.every((cell) => cell >= 0 && cell <= 9 && Number.isInteger(cell)),
  );
}

function isNonogramGrid(grid: unknown): grid is NonogramPlayState {
  if (!isSizedGrid(grid, NONOGRAM_ROWS)) return false;
  return grid.every((row) =>
    row.every(
      (cell) =>
        cell === NONOGRAM_EMPTY ||
        cell === 0 ||
        cell === NONOGRAM_FILL,
    ),
  );
}

export function isValidNonogramPuzzle(puzzle: unknown): boolean {
  if (puzzle == null || typeof puzzle !== 'object') return false;
  const p = puzzle as Record<string, unknown>;
  if (p.kind !== 'nonogram') return false;
  if (p.rows !== NONOGRAM_ROWS || p.cols !== NONOGRAM_COLS) return false;
  if (typeof p.pictureTitle !== 'string') return false;
  if (typeof p.puzzleHash !== 'string') return false;
  if (!Array.isArray(p.rowClues) || !Array.isArray(p.colClues)) return false;
  if (!Array.isArray(p.solution)) return false;
  if (p.solution.length !== NONOGRAM_ROWS) return false;
  return p.solution.every(
    (row) =>
      Array.isArray(row) &&
      row.length === NONOGRAM_COLS &&
      row.every((cell) => typeof cell === 'boolean'),
  );
}

export function isValidBinaryGivens(givens: unknown): givens is number[][] {
  if (!isSizedGrid(givens, BINARY_SIZE)) return false;
  return givens.every((row) =>
    row.every(
      (cell) =>
        cell === BINARY_EMPTY ||
        cell === BINARY_ZERO ||
        cell === BINARY_ONE,
    ),
  );
}

function isValidEdgeState(value: unknown): value is 0 | 1 | 2 {
  return value === EDGE_UNKNOWN || value === EDGE_LINE || value === EDGE_BLANK;
}

function isValidSlitherlinkEdgeGrid(
  grid: unknown,
  rows: number,
  cols: number,
): grid is number[][] {
  if (!Array.isArray(grid) || grid.length !== rows) return false;
  return grid.every(
    (row) =>
      Array.isArray(row) &&
      row.length === cols &&
      row.every((cell) => isValidEdgeState(cell)),
  );
}

function isValidSlitherlinkClues(clues: unknown): clues is (number | null)[][] {
  if (!Array.isArray(clues) || clues.length !== SLITHERLINK_SIZE) return false;
  return clues.every(
    (row) =>
      Array.isArray(row) &&
      row.length === SLITHERLINK_SIZE &&
      row.every(
        (cell) =>
          cell == null ||
          (typeof cell === 'number' &&
            Number.isInteger(cell) &&
            cell >= 0 &&
            cell <= 3),
      ),
  );
}

export function isValidSlitherlinkPlayState(
  play: unknown,
): play is SlitherlinkPlayState {
  if (play == null || typeof play !== 'object') return false;
  const p = play as Record<string, unknown>;
  return (
    isValidSlitherlinkEdgeGrid(p.h, SLITHERLINK_SIZE + 1, SLITHERLINK_SIZE) &&
    isValidSlitherlinkEdgeGrid(p.v, SLITHERLINK_SIZE, SLITHERLINK_SIZE + 1)
  );
}

export function isValidSlitherlinkPuzzle(puzzle: unknown): boolean {
  if (puzzle == null || typeof puzzle !== 'object') return false;
  const p = puzzle as Record<string, unknown>;
  if (p.kind !== 'slitherlink') return false;
  if (p.size !== SLITHERLINK_SIZE) return false;
  if (typeof p.puzzleHash !== 'string') return false;
  if (!isValidSlitherlinkClues(p.clues)) return false;
  if (p.solution == null || typeof p.solution !== 'object') return false;
  const solution = p.solution as Record<string, unknown>;
  return (
    isValidSlitherlinkEdgeGrid(
      solution.h,
      SLITHERLINK_SIZE + 1,
      SLITHERLINK_SIZE,
    ) &&
    isValidSlitherlinkEdgeGrid(
      solution.v,
      SLITHERLINK_SIZE,
      SLITHERLINK_SIZE + 1,
    )
  );
}

/** Accepts v1 JSON (puzzleStub / placeholder puzzle) and v2 snapshots on load. */
export function isPersistedSnapshotShape(
  value: unknown,
): value is PersistedSnapshot {
  if (value == null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const hasPuzzle = v.puzzle != null && typeof v.puzzle === 'object';
  const hasLegacyStub = v.puzzleStub != null && typeof v.puzzleStub === 'object';
  return (
    typeof v.dateKey === 'string' &&
    (v.gameType === 'sudoku' ||
      v.gameType === 'binary' ||
      v.gameType === 'nonogram' ||
      v.gameType === 'slitherlink') &&
    typeof v.seed === 'number' &&
    (v.status === 'playing' ||
      v.status === 'completed' ||
      v.status === 'abandoned') &&
    typeof v.puzzleHash === 'string' &&
    (hasPuzzle || hasLegacyStub)
  );
}

/** @deprecated Use isPersistedSnapshotShape for load; runtime uses DailySnapshot v2. */
export const isDailySnapshotShape = isPersistedSnapshotShape;

/** puzzle 与 gameType 一致且含有效 givens */
export function isSnapshotPuzzleConsistent(snapshot: DailySnapshot): boolean {
  if (snapshot.gameType === 'sudoku') {
    return (
      isSudokuPuzzle(snapshot.puzzle) &&
      isValidSudokuGivens(snapshot.puzzle.givens)
    );
  }

  if (snapshot.gameType === 'binary') {
    return (
      isBinaryPuzzle(snapshot.puzzle) &&
      isValidBinaryGivens(snapshot.puzzle.givens)
    );
  }

  if (snapshot.gameType === 'nonogram') {
    return (
      isNonogramPuzzle(snapshot.puzzle) &&
      isValidNonogramPuzzle(snapshot.puzzle)
    );
  }

  if (snapshot.gameType === 'slitherlink') {
    return (
      isSlitherlinkPuzzle(snapshot.puzzle) &&
      isValidSlitherlinkPuzzle(snapshot.puzzle)
    );
  }

  return false;
}

export function isPlayStateConsistent(
  snapshot: DailySnapshot,
): boolean {
  if (snapshot.playState == null) return true;
  if (snapshot.gameType === 'sudoku') {
    return isSizedGrid(snapshot.playState, SUDOKU_SIZE);
  }
  if (snapshot.gameType === 'binary') {
    return isSizedGrid(snapshot.playState, BINARY_SIZE);
  }
  if (snapshot.gameType === 'slitherlink') {
    return isValidSlitherlinkPlayState(snapshot.playState);
  }
  return isNonogramGrid(snapshot.playState);
}

/** True when `status: completed` matches a filled, valid board (or no playState). */
export function isCompletedPlayStateSatisfied(
  snapshot: DailySnapshot,
): boolean {
  if (snapshot.status !== 'completed' || snapshot.playState == null) {
    return true;
  }
  if (!isPlayStateConsistent(snapshot)) {
    return false;
  }

  switch (snapshot.gameType) {
    case 'sudoku': {
      if (!isSudokuPuzzle(snapshot.puzzle)) return false;
      const play = snapshot.playState;
      if (!isSizedGrid(play, SUDOKU_SIZE)) return false;
      return isSudokuComplete(play, snapshot.puzzle.givens);
    }
    case 'binary': {
      if (!isBinaryPuzzle(snapshot.puzzle)) return false;
      const play = snapshot.playState;
      if (!isSizedGrid(play, BINARY_SIZE)) return false;
      return isBinaryComplete(play, snapshot.puzzle.givens);
    }
    case 'nonogram': {
      if (!isNonogramPuzzle(snapshot.puzzle)) return false;
      const play = snapshot.playState;
      if (!isNonogramGrid(play)) return false;
      return isNonogramComplete(play, snapshot.puzzle.solution);
    }
    case 'slitherlink':
      return (
        isSlitherlinkPuzzle(snapshot.puzzle) &&
        isValidSlitherlinkPlayState(snapshot.playState) &&
        isSlitherlinkComplete(snapshot.playState, snapshot.puzzle)
      );
    default:
      return false;
  }
}

export function isGameType(value: unknown): value is GameType {
  return (
    value === 'sudoku' ||
    value === 'binary' ||
    value === 'nonogram' ||
    value === 'slitherlink'
  );
}

/** Strip legacy keys and stamp version before writing AsyncStorage. */
export function sanitizeSnapshotForSave(snapshot: DailySnapshot): DailySnapshot {
  const clean: DailySnapshot = {
    version: STORAGE_VERSION,
    dateKey: snapshot.dateKey,
    gameType: snapshot.gameType,
    seed: snapshot.seed,
    status: snapshot.status,
    puzzle: snapshot.puzzle,
    puzzleHash: snapshot.puzzleHash,
  };
  if (snapshot.playState != null) clean.playState = snapshot.playState;
  if (snapshot.startedAt != null) clean.startedAt = snapshot.startedAt;
  if (snapshot.finishedAt != null) clean.finishedAt = snapshot.finishedAt;
  if (snapshot.lastGameType != null) clean.lastGameType = snapshot.lastGameType;
  if (snapshot.lastPuzzleHash != null) {
    clean.lastPuzzleHash = snapshot.lastPuzzleHash;
  }
  return clean;
}
