import { STORAGE_VERSION } from '../../../../constants/config';
import { generateBinaryPuzzle } from '../../../../lib/puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../../lib/puzzles/binary/grid';
import { generateNonogramPuzzle } from '../../../../lib/puzzles/nonogram/generator';
import { createEmptyGrid as createEmptyNonogramGrid } from '../../../../lib/puzzles/nonogram/grid';
import { generateSudokuPuzzle } from '../../../../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../../lib/puzzles/sudoku/grid';
import type { DailySnapshot } from '../../../../lib/puzzles/types';
import { recoverSnapshot } from '../../../../lib/storage/snapshotRecover';
import { migrateSnapshot } from '../../../../lib/storage/snapshotMigration';
import { isSnapshotPuzzleConsistent } from '../../../../lib/storage/snapshotValidate';

function roundTrip(snapshot: DailySnapshot) {
  const migrated = migrateSnapshot(snapshot);
  expect(migrated).not.toBeNull();
  expect(migrated?.version).toBe(STORAGE_VERSION);
  expect(isSnapshotPuzzleConsistent(migrated!)).toBe(true);
  const recovered = recoverSnapshot(migrated!);
  expect(isSnapshotPuzzleConsistent(recovered.snapshot)).toBe(true);
}

describe('migration v2 snapshots', () => {
  it('sudoku mid-game survives migrate + recover', () => {
    const puzzle = generateSudokuPuzzle(1001);
    roundTrip({
      version: STORAGE_VERSION,
      dateKey: '2026-05-19',
      gameType: 'sudoku',
      seed: 1001,
      status: 'playing',
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: createEmptySudokuGrid(),
      startedAt: Date.now() - 30_000,
    });
  });

  it('binary completed survives migrate + recover', () => {
    const puzzle = generateBinaryPuzzle(2002);
    roundTrip({
      version: STORAGE_VERSION,
      dateKey: '2026-05-19',
      gameType: 'binary',
      seed: 2002,
      status: 'completed',
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: createEmptyBinaryGrid(),
      startedAt: Date.now() - 120_000,
      finishedAt: Date.now(),
    });
  });

  it('nonogram surrendered survives migrate + recover', () => {
    const puzzle = generateNonogramPuzzle(3003);
    roundTrip({
      version: STORAGE_VERSION,
      dateKey: '2026-05-19',
      gameType: 'nonogram',
      seed: 3003,
      status: 'abandoned',
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: createEmptyNonogramGrid(),
      startedAt: Date.now() - 90_000,
      finishedAt: Date.now(),
    });
  });
});
