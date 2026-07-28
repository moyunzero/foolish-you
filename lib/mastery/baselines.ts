import type { DifficultyTier } from '../puzzles/difficulty/tiers';
import type { GameType } from '../puzzles/types';

/** Static duration baselines (ms) per gameType × tier — tune later without schema change. */
export const MASTERY_BASELINES_MS: Record<
  GameType,
  Record<DifficultyTier, number>
> = {
  sudoku: {
    easy: 5 * 60_000,
    medium: 8 * 60_000,
    hard: 12 * 60_000,
    expert: 18 * 60_000,
  },
  binary: {
    easy: 3 * 60_000,
    medium: 5 * 60_000,
    hard: 8 * 60_000,
    expert: 12 * 60_000,
  },
  nonogram: {
    easy: 4 * 60_000,
    medium: 7 * 60_000,
    hard: 10 * 60_000,
    expert: 15 * 60_000,
  },
  slitherlink: {
    easy: 5 * 60_000,
    medium: 8 * 60_000,
    hard: 12 * 60_000,
    expert: 18 * 60_000,
  },
};
