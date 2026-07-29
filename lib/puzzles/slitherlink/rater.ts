import type { DifficultyTier } from '../difficulty/tiers';
import { createEmptyPlayState } from './edges';
import {
  SL_BIFURCATION_MAX_DEPTH,
  SL_BIFURCATION_MAX_NODES,
  tryBifurcation,
} from './bifurcation';
import {
  maxTechnique,
  peakToTier,
  type SlitherlinkTechnique,
} from './techniqueIds';
import { applyNextTechnique, hasUnknownEdge } from './techniques';
import {
  isPartialConsistent,
  isSingleLoopComplete,
} from './validate';
import { SLITHERLINK_SIZE } from './spec';
import { lineCountAroundCell } from './edges';

/** Re-export Expert bifurcation caps for tests / generate-for-tier. */
export { SL_BIFURCATION_MAX_DEPTH, SL_BIFURCATION_MAX_NODES };

/** Total technique applications per rate call (D-18). */
export const SL_MAX_TECHNIQUE_STEPS = 500;

export type RateSlitherlinkResult =
  | {
      status: 'solved';
      peak: SlitherlinkTechnique;
      tier: DifficultyTier;
    }
  | {
      status: 'incomplete';
      peak: SlitherlinkTechnique | null;
    }
  | {
      status: 'budget_exhausted';
      peak: SlitherlinkTechnique | null;
    };

function isValidClues(clues: (number | null)[][]): boolean {
  if (!Array.isArray(clues) || clues.length !== SLITHERLINK_SIZE) return false;
  for (let r = 0; r < SLITHERLINK_SIZE; r += 1) {
    const row = clues[r];
    if (!Array.isArray(row) || row.length !== SLITHERLINK_SIZE) return false;
    for (let c = 0; c < SLITHERLINK_SIZE; c += 1) {
      const v = row[c];
      if (v == null) continue;
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 4) {
        return false;
      }
    }
  }
  return true;
}

function cluesSatisfied(
  play: ReturnType<typeof createEmptyPlayState>,
  clues: (number | null)[][],
): boolean {
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      const clue = clues[row]![col];
      if (clue == null) continue;
      if (lineCountAroundCell(play, row, col) !== clue) return false;
    }
  }
  return true;
}

/**
 * SE-style human-technique rater: scan easiest→hardest, apply first hit,
 * track peak, restart until solved / stuck / step budget.
 * Never places via solveRecursive; step/node caps only (no wall-clock).
 */
export function rateSlitherlink(
  clues: (number | null)[][],
): RateSlitherlinkResult {
  if (!isValidClues(clues)) {
    return { status: 'incomplete', peak: null };
  }

  const play = createEmptyPlayState();
  if (!isPartialConsistent(play, clues)) {
    return { status: 'incomplete', peak: null };
  }

  let peak: SlitherlinkTechnique | null = null;
  let steps = 0;
  const bifurNodes = { count: 0 };

  while (hasUnknownEdge(play)) {
    if (steps >= SL_MAX_TECHNIQUE_STEPS) {
      return { status: 'budget_exhausted', peak };
    }
    steps += 1;

    if (!isPartialConsistent(play, clues)) {
      return { status: 'incomplete', peak };
    }

    const basic = applyNextTechnique(play, clues);
    if (basic.applied) {
      peak = maxTechnique(peak, basic.technique);
      continue;
    }

    const bif = tryBifurcation(play, clues, 0, bifurNodes);
    if (bif.applied) {
      peak = maxTechnique(peak, bif.technique);
      continue;
    }
    if (bif.budgetExceeded) {
      return { status: 'budget_exhausted', peak };
    }

    return { status: 'incomplete', peak };
  }

  // Solved: partial consistent + single loop + clues match (WR-01 parity).
  if (!isPartialConsistent(play, clues)) {
    return { status: 'incomplete', peak };
  }
  if (!isSingleLoopComplete(play)) {
    return { status: 'incomplete', peak };
  }
  if (!cluesSatisfied(play, clues)) {
    return { status: 'incomplete', peak };
  }

  if (peak == null) {
    // Already-determined empty-unknown board — treat as trivial easy.
    return { status: 'solved', peak: 'zero_elim', tier: 'easy' };
  }

  return {
    status: 'solved',
    peak,
    tier: peakToTier(peak),
  };
}

/** Peak→tier when solved; null when incomplete/budget. */
export function rateSlitherlinkPeak(
  clues: (number | null)[][],
): DifficultyTier | null {
  const result = rateSlitherlink(clues);
  if (result.status !== 'solved') return null;
  return result.tier;
}
