import {
  tierFromIndex,
  tierIndex,
  type DifficultyTier,
} from '../difficulty/tiers';
import { deriveSubSeed, hashStringToSeed, mulberry32 } from '../rng';
import type { NonogramPuzzle } from '../types';
import { computeClues } from './clues';
import { computePuzzleHash } from './hash';
import {
  NONOGRAM_PATTERNS,
  patternSolution,
  patternsForDifficultyTier,
  type NonogramPattern,
} from './patterns';
import { rateNonogram } from './rater';
import { NONOGRAM_COLS, NONOGRAM_ROWS } from './spec';
import type { NonogramTechnique } from './techniqueIds';
import { applyTransform, type TransformFlags } from './transform';

/** Soften steps Expert→Easy (D-06). */
export const NONOGRAM_TIER_MAX_SOFTENS = 3;

export type GenerateNonogramForTierResult = {
  puzzle: NonogramPuzzle;
  ratedTier: DifficultyTier;
  peakTechnique: NonogramTechnique;
  softened: boolean;
};

export type GenerateNonogramForTierOptions = {
  /** Injectable library for SC-2 synthetic empty-pool tests. */
  patterns?: NonogramPattern[];
};

/** Soften one step toward easier; Easy stays Easy (D-05). */
export function softenTowardEasier(tier: DifficultyTier): DifficultyTier {
  const idx = tierIndex(tier);
  if (idx <= 0) return 'easy';
  return tierFromIndex(idx - 1);
}

function pickTransform(seed: number): TransformFlags {
  const rng = mulberry32(deriveSubSeed(seed, 'nono-xform'));
  return {
    mirrorX: rng() < 0.5,
    mirrorY: rng() < 0.5,
  };
}

function buildPuzzleFromPattern(
  seed: number,
  pattern: NonogramPattern,
): NonogramPuzzle {
  const transform = pickTransform(seed);
  const solution = applyTransform(patternSolution(pattern), transform);
  const { rowClues, colClues } = computeClues(solution);
  const puzzleHash = computePuzzleHash({
    patternId: pattern.id,
    mirrorX: transform.mirrorX,
    mirrorY: transform.mirrorY,
    rowClues,
    colClues,
  });

  return {
    kind: 'nonogram',
    rows: NONOGRAM_ROWS,
    cols: NONOGRAM_COLS,
    rowClues,
    colClues,
    solution,
    pictureTitle: pattern.id,
    puzzleHash,
  };
}

function peakFromCanonical(pattern: NonogramPattern): NonogramTechnique {
  const { rowClues, colClues } = computeClues(patternSolution(pattern));
  const rated = rateNonogram(rowClues, colClues);
  if (rated.status !== 'solved') {
    throw new Error(
      `Failed to rate nonogram pattern ${pattern.id} for forTier peak`,
    );
  }
  return rated.peak;
}

/**
 * Filter curated library by difficultyTier; soften toward easier ≤3.
 * Never carve; never returns harder than requested; Easy-empty throws (D-05..D-09).
 */
export function generateNonogramPuzzleForTier(
  seed: number,
  targetTier: DifficultyTier,
  options?: GenerateNonogramForTierOptions,
): GenerateNonogramForTierResult {
  const library = options?.patterns ?? NONOGRAM_PATTERNS;
  let tier = targetTier;
  let softened = false;

  for (let soft = 0; soft <= NONOGRAM_TIER_MAX_SOFTENS; soft += 1) {
    const pool = patternsForDifficultyTier(tier, library);
    if (pool.length > 0) {
      const idx =
        hashStringToSeed(`${seed}:nono-tier-${tier}-${soft}`) % pool.length;
      const pattern = pool[idx]!;
      const puzzle = buildPuzzleFromPattern(seed, pattern);
      return {
        puzzle,
        ratedTier: pattern.difficultyTier,
        peakTechnique: peakFromCanonical(pattern),
        softened,
      };
    }

    const easier = softenTowardEasier(tier);
    if (easier === tier) break;
    tier = easier;
    softened = true;
  }

  throw new Error(`Failed to generate nonogram for tier ${targetTier}`);
}
