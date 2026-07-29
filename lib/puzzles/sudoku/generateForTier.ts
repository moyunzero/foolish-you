import {
  tierFromIndex,
  tierIndex,
  type DifficultyTier,
} from '../difficulty/tiers';
import { deriveSubSeed } from '../rng';
import type { SudokuPuzzle } from '../types';
import { generateOnce } from './generator';
import { rateSudoku } from './rater';
import { countSolutionsUpTo } from './solver';
import type { SudokuTechnique } from './techniqueIds';

/** Attempts per current target before softening toward easier (D-03/D-04). */
export const SUDOKU_TIER_MAX_ATTEMPTS = 40;

/** Soften steps Expert→Easy (discretion lock). */
export const SUDOKU_TIER_MAX_SOFTENS = 3;

export type GenerateForTierResult = {
  puzzle: SudokuPuzzle;
  ratedTier: DifficultyTier;
  peakTechnique: SudokuTechnique;
  softened: boolean;
};

/** Given-count guides only — peak technique gates acceptance (D-02). */
export function givenGuideForTier(tier: DifficultyTier): number {
  switch (tier) {
    case 'easy':
      return 36;
    case 'medium':
      return 33;
    case 'hard':
      return 29;
    case 'expert':
      return 25;
  }
}

/** Soften one step toward easier; Easy stays Easy (D-03). */
export function softenTowardEasier(tier: DifficultyTier): DifficultyTier {
  const idx = tierIndex(tier);
  if (idx <= 0) return 'easy';
  return tierFromIndex(idx - 1);
}

/**
 * Carve with given guides, require unique solution, accept only exact peak tier.
 * Softens toward easier after attempt budget; never returns harder than requested.
 */
export function generateSudokuPuzzleForTier(
  seed: number,
  targetTier: DifficultyTier,
): GenerateForTierResult {
  let tier = targetTier;
  let softened = false;

  for (let soft = 0; soft <= SUDOKU_TIER_MAX_SOFTENS; soft += 1) {
    const guide = givenGuideForTier(tier);

    for (let attempt = 0; attempt < SUDOKU_TIER_MAX_ATTEMPTS; attempt += 1) {
      const sub = deriveSubSeed(seed, `tier-${tier}-${soft}-${attempt}`);
      const once = generateOnce(sub, guide);
      if (once == null) continue;
      if (countSolutionsUpTo(once.givens, 2) !== 1) continue;

      const rated = rateSudoku(once.givens);
      if (rated.status !== 'solved') continue;
      if (rated.tier !== tier) continue;

      return {
        puzzle: once,
        ratedTier: rated.tier,
        peakTechnique: rated.peak,
        softened,
      };
    }

    const easier = softenTowardEasier(tier);
    if (easier === tier) break;
    tier = easier;
    softened = true;
  }

  throw new Error(`Failed to generate sudoku for tier ${targetTier}`);
}
