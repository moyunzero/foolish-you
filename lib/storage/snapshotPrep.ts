import { STORAGE_VERSION } from '../../constants/config';
import { selectDailyGame } from '../puzzles/dailySelector';
import { createEmptyGrid as createEmptyBinaryGrid } from '../puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../puzzles/nonogram/grid';
import { createEmptyPlayState as createEmptySlitherlinkPlayState } from '../puzzles/slitherlink/edges';
import { createEmptyGrid as createEmptySudokuGrid } from '../puzzles/sudoku/grid';
import type { DailySnapshot, GameType } from '../puzzles/types';
import {
  isPersistedPuzzlePlaceholder,
  type PersistedSnapshot,
  snapshotNeedsV2Upgrade,
} from './snapshotLegacy';
import {
  isPlayStateConsistent,
  isSnapshotPuzzleConsistent,
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

/** Same puzzle path as fresh daily selection for dateKey + seed + gameType. */
function canonicalDailyPuzzle(
  dateKey: string,
  seed: number,
  gameType: GameType,
): Pick<DailySnapshot, 'puzzle' | 'puzzleHash'> {
  const selected = selectDailyGame({
    dateKey,
    seed,
    forceGameType: gameType,
  });
  return { puzzle: selected.puzzle, puzzleHash: selected.puzzleHash };
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
  const { puzzle, puzzleHash } = canonicalDailyPuzzle(
    persisted.dateKey,
    persisted.seed,
    persisted.gameType,
  );
  return {
    ...persistedToDailyBase(persisted),
    puzzle,
    puzzleHash,
    playState:
      persisted.playState ?? emptyPlayStateForGameType(persisted.gameType),
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

  return {
    ...record,
    version: STORAGE_VERSION,
    puzzle,
    puzzleHash,
    playState: isPlayStateConsistent(record)
      ? record.playState
      : emptyPlayStateForGameType(record.gameType),
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
