import { STORAGE_VERSION } from '../../constants/config';
import { generateBinaryPuzzle } from '../../lib/puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../lib/puzzles/binary/grid';
import { generateSudokuPuzzle } from '../../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../../lib/puzzles/sudoku/grid';
import type { DailySnapshot, PlayState } from '../../lib/puzzles/types';

export const FIXTURE_TODAY = '2026-05-19';
export const FIXTURE_YESTERDAY = '2026-05-18';
export const FIXTURE_TOMORROW = '2026-05-20';

export function makeBinaryPlayingSnapshot(
  overrides: Partial<DailySnapshot> = {},
): DailySnapshot {
  const puzzle = generateBinaryPuzzle(4242);
  return {
    version: STORAGE_VERSION,
    dateKey: FIXTURE_TODAY,
    gameType: 'binary',
    seed: 4242,
    status: 'playing',
    puzzle,
    puzzleHash: puzzle.puzzleHash,
    playState: createEmptyBinaryGrid(),
    startedAt: 1_700_000_000_000,
    ...overrides,
  };
}

export function makeSudokuPlayingSnapshot(
  overrides: Partial<DailySnapshot> = {},
): DailySnapshot {
  const puzzle = generateSudokuPuzzle(9001);
  return {
    version: STORAGE_VERSION,
    dateKey: FIXTURE_TODAY,
    gameType: 'sudoku',
    seed: 9001,
    status: 'playing',
    puzzle,
    puzzleHash: puzzle.puzzleHash,
    playState: createEmptySudokuGrid(),
    startedAt: 1_700_000_000_000,
    ...overrides,
  };
}

/** Toggle first empty cell in play state (binary: 0→1, sudoku: 0→1). */
export function withOneFilledCell(playState: PlayState): PlayState {
  const next = playState.map((row) => [...row]);
  for (let r = 0; r < next.length; r += 1) {
    for (let c = 0; c < next[r].length; c += 1) {
      if (next[r][c] === 0) {
        next[r][c] = 1;
        return next;
      }
    }
  }
  return next;
}
