import { STORAGE_VERSION } from '../../../constants/config';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import type { DailySnapshot } from '../../../lib/puzzles/types';
import type { PersistedSnapshot } from '../../../lib/storage/snapshotLegacy';
import {
  normalizeSnapshotToV2,
  prepareTodaySnapshot,
  repairSnapshotPuzzle,
  upgradePersistedSnapshotV1,
} from '../../../lib/storage/snapshotPrep';
import { isSnapshotPuzzleConsistent } from '../../../lib/storage/snapshotValidate';

describe('snapshotPrep', () => {
  it('upgradePersistedSnapshotV1 replaces puzzleStub with real sudoku', () => {
    const legacy: PersistedSnapshot = {
      version: 1,
      dateKey: '2026-05-18',
      gameType: 'sudoku',
      seed: 4242,
      status: 'playing',
      puzzle: { kind: 'sudoku', placeholder: true },
      puzzleHash: 'legacy',
      puzzleStub: { kind: 'sudoku', placeholder: true },
    };

    const next = upgradePersistedSnapshotV1(legacy);
    expect(next.version).toBe(STORAGE_VERSION);
    expect(next).not.toHaveProperty('puzzleStub');
    expect(isSnapshotPuzzleConsistent(next)).toBe(true);
    expect(next.gameType).toBe('sudoku');
  });

  it('normalizeSnapshotToV2 matches load-time migration', () => {
    const legacy: PersistedSnapshot = {
      version: 1,
      dateKey: '2026-05-18',
      gameType: 'binary',
      seed: 7,
      status: 'playing',
      puzzle: { kind: 'binary', placeholder: true },
      puzzleHash: 'stub',
    };
    const next = normalizeSnapshotToV2(legacy);
    expect(next.version).toBe(2);
    expect(isSnapshotPuzzleConsistent(next)).toBe(true);
  });

  it('repairs inconsistent puzzle via prepareTodaySnapshot', () => {
    const broken: DailySnapshot = {
      version: 2,
      dateKey: '2026-05-18',
      gameType: 'binary',
      seed: 99,
      status: 'playing',
      puzzle: {
        kind: 'sudoku',
        givens: createEmptySudokuGrid(),
        puzzleHash: 'wrong',
      },
      puzzleHash: 'wrong',
    };

    const next = prepareTodaySnapshot(broken);
    expect(isSnapshotPuzzleConsistent(next)).toBe(true);
    expect(next.gameType).toBe('binary');
  });

  it('repairSnapshotPuzzle fills binary givens when placeholder in puzzle field', () => {
    const stub: PersistedSnapshot = {
      version: 1,
      dateKey: '2026-05-18',
      gameType: 'binary',
      seed: 7,
      status: 'playing',
      puzzle: { kind: 'binary', placeholder: true },
      puzzleHash: 'stub',
    };

    const next = repairSnapshotPuzzle(
      upgradePersistedSnapshotV1(stub),
    );
    expect(isSnapshotPuzzleConsistent(next)).toBe(true);
    expect(next.puzzle.kind).toBe('binary');
  });
});
