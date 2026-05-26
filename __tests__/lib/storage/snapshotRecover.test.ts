import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
import { generateBinaryPuzzle } from '../../../lib/puzzles/binary/generator';
import { deriveSubSeed } from '../../../lib/puzzles/rng';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';
import type { DailySnapshot } from '../../../lib/puzzles/types';
import { recoverSnapshot } from '../../../lib/storage/snapshotRecover';

describe('recoverSnapshot', () => {
  it('resets playState when completed but board is empty', () => {
    const puzzle = generateSudokuPuzzle(42);
    const snapshot: DailySnapshot = {
      version: 2,
      dateKey: '2026-05-20',
      gameType: 'sudoku',
      seed: 42,
      status: 'completed',
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: createEmptySudokuGrid(),
      startedAt: Date.now() - 60_000,
      finishedAt: Date.now(),
    };

    const result = recoverSnapshot(snapshot);
    expect(result.damage).toBe('play_state_contradiction');
    expect(result.snapshot.status).toBe('completed');
    expect(result.snapshot.playState).toBeUndefined();
  });

  it('repairs inconsistent puzzle from seed', () => {
    const puzzle = generateBinaryPuzzle(deriveSubSeed(7, 'binary-migrate'));
    const broken: DailySnapshot = {
      version: 2,
      dateKey: '2026-05-20',
      gameType: 'binary',
      seed: 7,
      status: 'playing',
      puzzle: {
        kind: 'sudoku',
        givens: createEmptySudokuGrid(),
        puzzleHash: 'wrong',
      },
      puzzleHash: 'wrong',
      playState: createEmptyBinaryGrid(),
    };

    const result = recoverSnapshot(broken);
    expect(result.damage).toBe('puzzle_inconsistent');
    expect(result.snapshot.gameType).toBe('binary');
    expect(result.snapshot.puzzleHash).toBe(puzzle.puzzleHash);
  });
});
