import {
  isDailySnapshotShape,
  isSnapshotPuzzleConsistent,
  isValidBinaryGivens,
  isValidSudokuGivens,
} from '../../../lib/storage/snapshotValidate';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import type { DailySnapshot } from '../../../lib/puzzles/types';
import type { PersistedSnapshot } from '../../../lib/storage/snapshotLegacy';

describe('snapshotValidate', () => {
  it('accepts valid sudoku givens', () => {
    expect(isValidSudokuGivens(createEmptySudokuGrid())).toBe(true);
  });

  it('rejects malformed sudoku givens', () => {
    expect(isValidSudokuGivens([[1]])).toBe(false);
  });

  it('accepts valid binary givens', () => {
    expect(isValidBinaryGivens(createEmptyBinaryGrid())).toBe(true);
  });

  it('accepts v1 placeholder on disk but not as consistent v2 snapshot', () => {
    const persisted: PersistedSnapshot = {
      version: 1,
      dateKey: '2026-05-18',
      gameType: 'binary',
      seed: 1,
      status: 'playing',
      puzzle: { kind: 'binary', placeholder: true },
      puzzleHash: 'x',
      puzzleStub: { kind: 'binary', placeholder: true },
    };
    expect(isDailySnapshotShape(persisted)).toBe(true);
    expect(
      isSnapshotPuzzleConsistent(persisted as unknown as DailySnapshot),
    ).toBe(false);
  });

  it('detects gameType vs puzzle mismatch', () => {
    const snapshot: DailySnapshot = {
      version: 2,
      dateKey: '2026-05-18',
      gameType: 'sudoku',
      seed: 1,
      status: 'playing',
      puzzle: {
        kind: 'binary',
        givens: createEmptyBinaryGrid(),
        puzzleHash: 'bin',
      },
      puzzleHash: 'bin',
    };
    expect(isSnapshotPuzzleConsistent(snapshot)).toBe(false);
  });
});
