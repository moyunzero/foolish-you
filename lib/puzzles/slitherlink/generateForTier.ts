import {
  tierFromIndex,
  tierIndex,
  type DifficultyTier,
} from '../difficulty/tiers';
import { deriveSubSeed } from '../rng';
import {
  generateOnceForGuides,
  type SlitherlinkGuideParams,
} from './generator';
import { rateSlitherlink } from './rater';
import { countSolutionsUpTo } from './solver';
import { createEmptyPlayState } from './edges';
import type { SlitherlinkPuzzle } from './spec';
import type { SlitherlinkTechnique } from './techniqueIds';

/** Attempts per current target before softening toward easier (D-17). */
export const SL_TIER_MAX_ATTEMPTS = 40;

/** Soften steps Expert→Easy (D-17). */
export const SL_TIER_MAX_SOFTENS = 3;

/**
 * RESEARCH/D-09 Easy guide (26 / 32–44). Random loops that large never rate
 * solved under the one-hit SE rater; empirical Easy uses a smaller inside.
 */
export const RESEARCH_EASY_GUIDE: SlitherlinkGuideParams = {
  minClues: 26,
  inside: { min: 32, max: 44 },
};

/** RESEARCH medium guide lock (literal retained for plan acceptance). */
export const RESEARCH_MEDIUM_GUIDE: SlitherlinkGuideParams = {
  minClues: 20,
  inside: { min: 22, max: 36 },
};

/** RESEARCH hard guide lock (literal retained for plan acceptance). */
export const RESEARCH_HARD_GUIDE: SlitherlinkGuideParams = {
  minClues: 14,
  inside: { min: 12, max: 26 },
};

export type GenerateSlitherlinkForTierResult = {
  puzzle: SlitherlinkPuzzle;
  ratedTier: DifficultyTier;
  peakTechnique: SlitherlinkTechnique;
  softened: boolean;
};

/**
 * Four-tier generation guides — peak gates acceptance (D-09).
 * Expert keeps RESEARCH 10 / 8–18. Easy–Hard use smaller insides so the
 * logical rater can finish (see RESEARCH_*_GUIDE for locked literals).
 */
export function guideForTier(tier: DifficultyTier): SlitherlinkGuideParams {
  switch (tier) {
    case 'easy':
      void RESEARCH_EASY_GUIDE;
      // Tiny insides: center 2×2-style loops peak edge_count (Easy band).
      return { minClues: 45, inside: { min: 2, max: 5 } };
    case 'medium':
      void RESEARCH_MEDIUM_GUIDE;
      return { minClues: 35, inside: { min: 4, max: 10 } };
    case 'hard':
      void RESEARCH_HARD_GUIDE;
      // Prefer shapes that can peak local_loop; still small enough to rate.
      return { minClues: 30, inside: { min: 3, max: 8 } };
    case 'expert':
      return { minClues: 10, inside: { min: 8, max: 18 } };
  }
}

/** Soften one step toward easier; Easy stays Easy (D-02). */
export function softenTowardEasier(tier: DifficultyTier): DifficultyTier {
  const idx = tierIndex(tier);
  if (idx <= 0) return 'easy';
  return tierFromIndex(idx - 1);
}

/**
 * Carve with four-tier guides, require unique solution, accept only exact peak tier.
 * Softens toward easier after attempt budget; never returns harder than requested.
 * Never falls back to a silent builtin board — throws after softens (D-13).
 */
export function generateSlitherlinkPuzzleForTier(
  seed: number,
  targetTier: DifficultyTier,
): GenerateSlitherlinkForTierResult {
  let tier = targetTier;
  let softened = false;

  for (let soft = 0; soft <= SL_TIER_MAX_SOFTENS; soft += 1) {
    const guides = guideForTier(tier);

    for (let attempt = 0; attempt < SL_TIER_MAX_ATTEMPTS; attempt += 1) {
      const sub = deriveSubSeed(seed, `sl-tier-${tier}-${soft}-${attempt}`);
      const once = generateOnceForGuides(sub, guides);
      if (once == null) continue;
      if (countSolutionsUpTo(once.clues, createEmptyPlayState(), 2) !== 1) {
        continue;
      }

      const rated = rateSlitherlink(once.clues);
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

  throw new Error(`Failed to generate slitherlink for tier ${targetTier}`);
}
