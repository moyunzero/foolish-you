import { BINARY_EMPTY, BINARY_ONE, BINARY_ZERO } from '../puzzles/binary/grid';
import { BINARY_SIZE } from '../puzzles/binary/spec';
import { SUDOKU_SIZE } from '../puzzles/sudoku/grid';
import { STORAGE_VERSION } from '../../constants/config';
import type { DailySnapshot, GameType } from '../puzzles/types';
import { isBinaryPuzzle, isSudokuPuzzle } from '../puzzles/types';
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
    (v.gameType === 'sudoku' || v.gameType === 'binary') &&
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

  return false;
}

export function isPlayStateConsistent(
  snapshot: DailySnapshot,
): boolean {
  if (snapshot.playState == null) return true;
  if (snapshot.gameType === 'sudoku') {
    return isSizedGrid(snapshot.playState, SUDOKU_SIZE);
  }
  return isSizedGrid(snapshot.playState, BINARY_SIZE);
}

export function isGameType(value: unknown): value is GameType {
  return value === 'sudoku' || value === 'binary';
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
