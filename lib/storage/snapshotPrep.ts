import { STORAGE_VERSION } from '../../constants/config';
import { createEmptyGrid as createEmptyBinaryGrid } from '../puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../puzzles/nonogram/grid';
import { selectDailyGameSafe } from '../puzzles/dailySelectorSafe';
import { createEmptyPlayState as createEmptySlitherlinkPlayState } from '../puzzles/slitherlink/edges';
import { createEmptyGrid as createEmptySudokuGrid } from '../puzzles/sudoku/grid';
import type { DailySnapshot, GameType } from '../puzzles/types';
import {
  isPersistedPuzzlePlaceholder,
  type PersistedSnapshot,
  snapshotNeedsV2Upgrade,
} from './snapshotLegacy';
import {
  isSnapshotPuzzleConsistent,
  isValidSudokuNotes,
} from './snapshotValidate';

function emptyPlayStateForGameType(gameType: GameType) {
  switch (gameType) {
    case 'sudoku':
      return createEmptySudokuGrid();
    case 'binary':
      return createEmptyBinaryGrid();
    case 'nonogram':
      return createEmptyNonogramGrid();
    default:
      return createEmptySlitherlinkPlayState();
  }
}

/**
 * Disaster-repair reconstruction: seed + gameType + DEFAULT mastery / empty avoid.
 * Uses Safe so forTier avoid exhaustion cannot throw into hydrate (create path
 * already uses Safe). Does NOT replay adaptive create (mastery / avoid attempt).
 * Callers that regenerate MUST clear playState — fills must not sit on a
 * different board (CR-01). Fallback puzzles are not dateKey-deterministic.
 */
function canonicalDailyPuzzle(
  dateKey: string,
  seed: number,
  gameType: GameType,
): Pick<DailySnapshot, 'puzzle' | 'puzzleHash'> {
  const selected = selectDailyGameSafe({
    dateKey,
    seed,
    forceGameType: gameType,
  });
  return { puzzle: selected.puzzle, puzzleHash: selected.puzzleHash };
}

function persistedToDailyBase(persisted: PersistedSnapshot): DailySnapshot {
  const base: DailySnapshot = {
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
  const rawNotes = (persisted as Record<string, unknown>).sudokuNotes;
  if (
    persisted.gameType === 'sudoku' &&
    rawNotes != null &&
    isValidSudokuNotes(rawNotes)
  ) {
    base.sudokuNotes = rawNotes;
  }
  return base;
}

function upgradePlaceholderFields(
  persisted: PersistedSnapshot,
): DailySnapshot {
  const { puzzle, puzzleHash } = canonicalDailyPuzzle(
    persisted.dateKey,
    persisted.seed,
    persisted.gameType,
  );
  const base = persistedToDailyBase(persisted);
  const { sudokuNotes: _omit, ...withoutNotes } = base;
  return {
    ...withoutNotes,
    puzzle,
    puzzleHash,
    // Regenerated board may differ from any prior adaptive create — wipe fills + notes.
    playState: emptyPlayStateForGameType(persisted.gameType),
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

  const { puzzle, puzzleHash } = canonicalDailyPuzzle(
    record.dateKey,
    record.seed,
    record.gameType,
  );

  const { sudokuNotes: _omit, ...rest } = record;
  return {
    ...rest,
    version: STORAGE_VERSION,
    puzzle,
    puzzleHash,
    // Always clear fills when regenerating — shape-consistent playState can still
    // belong to a different adaptive board than DEFAULT-mastery reconstruction.
    playState: emptyPlayStateForGameType(record.gameType),
  };
}

/** Load-time normalization: v0/v1/v2 → current STORAGE_VERSION, repair inconsistent puzzles. */
export function normalizeSnapshotToV2(
  persisted: PersistedSnapshot,
): DailySnapshot {
  let next = snapshotNeedsV2Upgrade(persisted)
    ? upgradePersistedSnapshotV1(persisted)
    : persistedToDailyBase(persisted);

  if (!isSnapshotPuzzleConsistent(next)) {
    next = repairSnapshotPuzzle(next);
  }

  // Invalid / non-sudoku notes never survive normalize (D-08); playState untouched.
  if (
    next.sudokuNotes != null &&
    (next.gameType !== 'sudoku' || !isValidSudokuNotes(next.sudokuNotes))
  ) {
    const { sudokuNotes: _omit, ...rest } = next;
    next = rest;
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
