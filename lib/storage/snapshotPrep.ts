import { STORAGE_VERSION } from '../../constants/config';
import { generateBinaryPuzzle } from '../puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../puzzles/binary/grid';
import { deriveSubSeed } from '../puzzles/rng';
import { generateSudokuPuzzle } from '../puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../puzzles/sudoku/grid';
import type { BinaryPuzzle, DailySnapshot, SudokuPuzzle } from '../puzzles/types';
import {
  isPersistedPuzzlePlaceholder,
  type PersistedSnapshot,
  snapshotNeedsV2Upgrade,
} from './snapshotLegacy';
import {
  isPlayStateConsistent,
  isSnapshotPuzzleConsistent,
} from './snapshotValidate';

function sudokuPuzzleFromSeed(seed: number): SudokuPuzzle {
  return generateSudokuPuzzle(deriveSubSeed(seed, 'migrate'));
}

function binaryPuzzleFromSeed(seed: number): BinaryPuzzle {
  return generateBinaryPuzzle(deriveSubSeed(seed, 'binary-migrate'));
}

function persistedToDailyBase(persisted: PersistedSnapshot): DailySnapshot {
  return {
    version: STORAGE_VERSION,
    dateKey: persisted.dateKey,
    gameType: persisted.gameType,
    seed: persisted.seed,
    status: persisted.status,
    puzzle: persisted.puzzle as DailySnapshot['puzzle'],
    puzzleHash: persisted.puzzleHash,
    playState: persisted.playState,
    startedAt: persisted.startedAt,
    finishedAt: persisted.finishedAt,
    lastGameType: persisted.lastGameType,
    lastPuzzleHash: persisted.lastPuzzleHash,
  };
}

function upgradePlaceholderFields(
  persisted: PersistedSnapshot,
): DailySnapshot {
  if (persisted.gameType === 'sudoku') {
    const puzzle = sudokuPuzzleFromSeed(persisted.seed);
    return {
      ...persistedToDailyBase(persisted),
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: persisted.playState ?? createEmptySudokuGrid(),
    };
  }

  const puzzle = binaryPuzzleFromSeed(persisted.seed);
  return {
    ...persistedToDailyBase(persisted),
    puzzle,
    puzzleHash: puzzle.puzzleHash,
    playState: persisted.playState ?? createEmptyBinaryGrid(),
  };
}

/** Upgrade v1 puzzleStub / placeholder puzzle to full givens (deterministic from seed). */
export function upgradePersistedSnapshotV1(
  persisted: PersistedSnapshot,
): DailySnapshot {
  const hasStubField = persisted.puzzleStub?.placeholder === true;
  const hasPlaceholderPuzzle = isPersistedPuzzlePlaceholder(persisted.puzzle);

  if (hasStubField || hasPlaceholderPuzzle) {
    return upgradePlaceholderFields(persisted);
  }

  const candidate = persistedToDailyBase(persisted);
  return isSnapshotPuzzleConsistent(candidate)
    ? candidate
    : repairSnapshotPuzzle(candidate);
}

export function repairSnapshotPuzzle(record: DailySnapshot): DailySnapshot {
  if (isSnapshotPuzzleConsistent(record)) {
    return record;
  }

  if (record.gameType === 'sudoku') {
    const puzzle = sudokuPuzzleFromSeed(record.seed);
    return {
      ...record,
      version: STORAGE_VERSION,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: isPlayStateConsistent(record)
        ? record.playState
        : createEmptySudokuGrid(),
    };
  }

  const puzzle = binaryPuzzleFromSeed(record.seed);
  return {
    ...record,
    version: STORAGE_VERSION,
    puzzle,
    puzzleHash: puzzle.puzzleHash,
    playState: isPlayStateConsistent(record)
      ? record.playState
      : createEmptyBinaryGrid(),
  };
}

/** Load-time normalization: v1 → v2, repair inconsistent puzzles. */
export function normalizeSnapshotToV2(
  persisted: PersistedSnapshot,
): DailySnapshot {
  let next = snapshotNeedsV2Upgrade(persisted)
    ? upgradePersistedSnapshotV1(persisted)
    : persistedToDailyBase(persisted);

  if (!isSnapshotPuzzleConsistent(next)) {
    next = repairSnapshotPuzzle(next);
  }

  return { ...next, version: STORAGE_VERSION };
}

/** Same-day hydrate: repair only (v2 upgrade already ran in loadDailySnapshot). */
export function prepareTodaySnapshot(record: DailySnapshot): DailySnapshot {
  if (isSnapshotPuzzleConsistent(record)) {
    return record;
  }
  return repairSnapshotPuzzle(record);
}
