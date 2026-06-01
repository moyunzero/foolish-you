import { STORAGE_VERSION } from '../../constants/config';
import { generateBinaryPuzzle } from '../puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../puzzles/binary/grid';
import { generateNonogramPuzzle } from '../puzzles/nonogram/generator';
import { createEmptyGrid as createEmptyNonogramGrid } from '../puzzles/nonogram/grid';
import { deriveSubSeed } from '../puzzles/rng';
import { generateSlitherlinkPuzzle } from '../puzzles/slitherlink/generator';
import { createEmptyPlayState as createEmptySlitherlinkPlayState } from '../puzzles/slitherlink/edges';
import { generateSudokuPuzzle } from '../puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../puzzles/sudoku/grid';
import type {
  BinaryPuzzle,
  DailySnapshot,
  NonogramPuzzle,
  SlitherlinkPuzzle,
  SudokuPuzzle,
} from '../puzzles/types';
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

function nonogramPuzzleFromSeed(seed: number): NonogramPuzzle {
  return generateNonogramPuzzle(deriveSubSeed(seed, 'nonogram-migrate'));
}

function slitherlinkPuzzleFromSeed(seed: number): SlitherlinkPuzzle {
  return generateSlitherlinkPuzzle(deriveSubSeed(seed, 'slitherlink-migrate'));
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

  if (persisted.gameType === 'binary') {
    const puzzle = binaryPuzzleFromSeed(persisted.seed);
    return {
      ...persistedToDailyBase(persisted),
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: persisted.playState ?? createEmptyBinaryGrid(),
    };
  }

  if (persisted.gameType === 'nonogram') {
    const puzzle = nonogramPuzzleFromSeed(persisted.seed);
    return {
      ...persistedToDailyBase(persisted),
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: persisted.playState ?? createEmptyNonogramGrid(),
    };
  }

  const puzzle = slitherlinkPuzzleFromSeed(persisted.seed);
  return {
    ...persistedToDailyBase(persisted),
    puzzle,
    puzzleHash: puzzle.puzzleHash,
    playState: persisted.playState ?? createEmptySlitherlinkPlayState(),
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

  if (record.gameType === 'binary') {
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

  if (record.gameType === 'nonogram') {
    const puzzle = nonogramPuzzleFromSeed(record.seed);
    return {
      ...record,
      version: STORAGE_VERSION,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: isPlayStateConsistent(record)
        ? record.playState
        : createEmptyNonogramGrid(),
    };
  }

  const puzzle = slitherlinkPuzzleFromSeed(record.seed);
  return {
    ...record,
    version: STORAGE_VERSION,
    puzzle,
    puzzleHash: puzzle.puzzleHash,
    playState: isPlayStateConsistent(record)
      ? record.playState
      : createEmptySlitherlinkPlayState(),
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
