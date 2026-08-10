import { STORAGE_VERSION } from '../../../constants/config';
import * as dailySelector from '../../../lib/puzzles/dailySelector';
import { selectDailyGameSafe } from '../../../lib/puzzles/dailySelectorSafe';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
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
    expect(next.version).toBe(STORAGE_VERSION);
    expect(isSnapshotPuzzleConsistent(next)).toBe(true);
  });

  it('repairSnapshotPuzzle matches selectDailyGameSafe for seed and gameType', () => {
    const canonical = selectDailyGameSafe({
      dateKey: '2026-06-01',
      seed: 12345,
      forceGameType: 'binary',
    });
    const broken = {
      version: STORAGE_VERSION,
      dateKey: '2026-06-01',
      gameType: 'binary' as const,
      seed: 12345,
      status: 'playing' as const,
      puzzle: {
        kind: 'sudoku' as const,
        givens: createEmptySudokuGrid(),
        puzzleHash: 'wrong',
      },
      puzzleHash: 'wrong',
    };

    const next = repairSnapshotPuzzle(broken);
    expect(next.puzzleHash).toBe(canonical.puzzleHash);
  });

  it('prepareTodaySnapshot does not throw when selectDailyGame exhausts', () => {
    const spy = jest
      .spyOn(dailySelector, 'selectDailyGame')
      .mockImplementation(() => {
        throw new Error(
          'Failed to generate binary for tier easy after avoid retries',
        );
      });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const broken: DailySnapshot = {
      version: STORAGE_VERSION,
      dateKey: '2026-06-01',
      gameType: 'binary',
      seed: 12345,
      status: 'playing',
      puzzle: {
        kind: 'sudoku',
        givens: createEmptySudokuGrid(),
        puzzleHash: 'wrong',
      },
      puzzleHash: 'wrong',
    };

    try {
      expect(() => prepareTodaySnapshot(broken)).not.toThrow();
      const next = prepareTodaySnapshot(broken);
      expect(isSnapshotPuzzleConsistent(next)).toBe(true);
      expect(next.gameType).toBe('binary');
      expect(next.playState).toEqual(createEmptyBinaryGrid());
    } finally {
      spy.mockRestore();
      warnSpy.mockRestore();
    }
  });

  it('repairSnapshotPuzzle clears playState when regenerating puzzle', () => {
    const filled = createEmptyBinaryGrid().map((row, r) =>
      row.map((_, c) => (r === 0 && c === 0 ? 1 : 0)),
    );
    const broken: DailySnapshot = {
      version: STORAGE_VERSION,
      dateKey: '2026-06-01',
      gameType: 'binary',
      seed: 12345,
      status: 'playing',
      puzzle: {
        kind: 'sudoku',
        givens: createEmptySudokuGrid(),
        puzzleHash: 'wrong',
      },
      puzzleHash: 'wrong',
      playState: filled,
    };

    const next = repairSnapshotPuzzle(broken);
    expect(isSnapshotPuzzleConsistent(next)).toBe(true);
    expect(next.playState).toEqual(createEmptyBinaryGrid());
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
