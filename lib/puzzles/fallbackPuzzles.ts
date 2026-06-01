import { generateBinaryPuzzle } from './binary/generator';
import { generateNonogramPuzzle } from './nonogram/generator';
import { isPuzzleSolvable } from './isSolvable';
import { deriveSeed } from './rng';
import { getSlitherlinkBuiltinPuzzle } from './slitherlink/builtinPuzzle';
import { generateSudokuPuzzle } from './sudoku/generator';
import type { GameType, PuzzlePayload } from './types';

/**
 * Deterministic seeds for offline fallback dailies (verified in unit tests).
 * Used only when `selectDailyGameSafe` cannot produce a solvable puzzle for today's dateKey;
 * snapshot still uses today's dateKey but seed/puzzleHash come from these fixed keys.
 */
export const FALLBACK_DATE_KEYS: Record<GameType, string> = {
  sudoku: '1970-01-01',
  binary: '1970-01-02',
  nonogram: '1970-01-03',
  slitherlink: '1970-01-04',
};

export function buildFallbackPuzzle(gameType: GameType): PuzzlePayload {
  const seed = deriveSeed(FALLBACK_DATE_KEYS[gameType]);
  if (gameType === 'sudoku') {
    return generateSudokuPuzzle(seed);
  }
  if (gameType === 'binary') {
    return generateBinaryPuzzle(seed);
  }
  if (gameType === 'nonogram') {
    return generateNonogramPuzzle(seed);
  }
  return getSlitherlinkBuiltinPuzzle();
}

export function getFallbackDailySelection(gameType: GameType): {
  gameType: GameType;
  seed: number;
  puzzle: PuzzlePayload;
  puzzleHash: string;
} {
  const puzzle = buildFallbackPuzzle(gameType);
  if (!isPuzzleSolvable(gameType, puzzle)) {
    throw new Error(`[fallbackPuzzles] built-in fallback not solvable: ${gameType}`);
  }
  return {
    gameType,
    seed: deriveSeed(FALLBACK_DATE_KEYS[gameType]),
    puzzle,
    puzzleHash: puzzle.puzzleHash,
  };
}
