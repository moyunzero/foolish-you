import {
  tierFromIndex,
  tierIndex,
  type DifficultyTier,
} from '../difficulty/tiers';
import { deriveSubSeed } from '../rng';
import type { BinaryPuzzle } from '../types';
import { generateOnce } from './generator';
import { rateBinary } from './rater';
import { countSolutionsUpTo } from './solver';
import type { BinaryTechnique } from './techniqueIds';

/** Attempts per current target before softening toward easier (D-17). */
export const BINARY_TIER_MAX_ATTEMPTS = 40;

/** Soften steps Expert→Easy (D-17). */
export const BINARY_TIER_MAX_SOFTENS = 3;

/**
 * RESEARCH/D-03 proposed Easy guide 30, but random unique carves at ≤44 givens
 * never peak at adjacent_pair/gap_fill (balance+ always). Empirical Easy carve.
 */
export const BINARY_EASY_CARVE_GIVENS = 56;

/** Documented RESEARCH Easy guide lock (literal retained for plan acceptance). */
const RESEARCH_EASY_GUIDE = 30;

export type GenerateBinaryForTierResult = {
  puzzle: BinaryPuzzle;
  ratedTier: DifficultyTier;
  peakTechnique: BinaryTechnique;
  softened: boolean;
};

/** Given-count guides only — peak technique gates acceptance (D-03). */
export function givenGuideForTier(tier: DifficultyTier): number {
  switch (tier) {
    case 'easy':
      // Carve uses denser Easy count; RESEARCH_EASY_GUIDE (30) kept as lock ref.
      void RESEARCH_EASY_GUIDE;
      return BINARY_EASY_CARVE_GIVENS;
    case 'medium':
      return 26;
    case 'hard':
      return 22;
    case 'expert':
      return 18;
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
 * Never falls back to a silent builtin board (D-13).
 */
export function generateBinaryPuzzleForTier(
  seed: number,
  targetTier: DifficultyTier,
): GenerateBinaryForTierResult {
  let tier = targetTier;
  let softened = false;

  for (let soft = 0; soft <= BINARY_TIER_MAX_SOFTENS; soft += 1) {
    const guide = givenGuideForTier(tier);

    for (let attempt = 0; attempt < BINARY_TIER_MAX_ATTEMPTS; attempt += 1) {
      const sub = deriveSubSeed(seed, `tier-${tier}-${soft}-${attempt}`);
      const once = generateOnce(sub, guide);
      if (once == null) continue;
      if (countSolutionsUpTo(once.givens, 2) !== 1) continue;

      const rated = rateBinary(once.givens);
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

  throw new Error(`Failed to generate binary for tier ${targetTier}`);
}
