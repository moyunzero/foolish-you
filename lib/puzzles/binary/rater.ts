import type { DifficultyTier } from '../difficulty/tiers';
import {
  BINARY_LOOKAHEAD_MAX_DEPTH,
  BINARY_LOOKAHEAD_MAX_NODES,
  tryLookAhead,
} from './lookAhead';
import {
  maxTechnique,
  peakToTier,
  type BinaryTechnique,
} from './techniqueIds';
import {
  applyNextTechnique,
  clonePlayGrid,
  isGridFull,
} from './techniques';
import { BINARY_EMPTY, BINARY_ONE, BINARY_ZERO } from './grid';
import { BINARY_SIZE } from './spec';
import { getViolationCells } from './validate';

/** Re-export Expert look-ahead caps for tests / generate-for-tier. */
export { BINARY_LOOKAHEAD_MAX_DEPTH, BINARY_LOOKAHEAD_MAX_NODES };

/** Total technique applications per rate call (D-18). */
export const BINARY_MAX_TECHNIQUE_STEPS = 500;

export type RateBinaryResult =
  | {
      status: 'solved';
      peak: BinaryTechnique;
      tier: DifficultyTier;
    }
  | {
      status: 'incomplete';
      peak: BinaryTechnique | null;
    }
  | {
      status: 'budget_exhausted';
      peak: BinaryTechnique | null;
    };

function isValidGivens(givens: number[][]): boolean {
  if (!Array.isArray(givens) || givens.length !== BINARY_SIZE) return false;
  for (let r = 0; r < BINARY_SIZE; r += 1) {
    const row = givens[r];
    if (!Array.isArray(row) || row.length !== BINARY_SIZE) return false;
    for (let c = 0; c < BINARY_SIZE; c += 1) {
      const v = row[c];
      if (
        typeof v !== 'number' ||
        !Number.isInteger(v) ||
        (v !== BINARY_EMPTY && v !== BINARY_ZERO && v !== BINARY_ONE)
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * SE-style human-technique rater: scan easiest→hardest, apply first hit,
 * track peak, restart until solved / stuck / step budget.
 * Never places via backtracking solver; step/node caps only (no wall-clock).
 */
export function rateBinary(givens: number[][]): RateBinaryResult {
  if (!isValidGivens(givens)) {
    return { status: 'incomplete', peak: null };
  }

  const grid = clonePlayGrid(givens);
  if (getViolationCells(grid).length > 0) {
    return { status: 'incomplete', peak: null };
  }

  let peak: BinaryTechnique | null = null;
  let steps = 0;
  // Shared node counter across look_ahead calls within one rate.
  const lookAheadNodes = { count: 0 };

  while (!isGridFull(grid)) {
    if (steps >= BINARY_MAX_TECHNIQUE_STEPS) {
      return { status: 'budget_exhausted', peak };
    }
    steps += 1;

    if (getViolationCells(grid).length > 0) {
      return { status: 'incomplete', peak };
    }

    const basic = applyNextTechnique(grid);
    if (basic.applied) {
      peak = maxTechnique(peak, basic.technique);
      continue;
    }

    const look = tryLookAhead(grid, 0, lookAheadNodes);
    if (look.applied) {
      peak = maxTechnique(peak, look.technique);
      continue;
    }
    if (look.budgetExceeded) {
      return { status: 'budget_exhausted', peak };
    }

    return { status: 'incomplete', peak };
  }

  // Full digit grid is solved only when conflict-free (validate-only; no solver).
  if (getViolationCells(grid).length > 0) {
    return { status: 'incomplete', peak };
  }

  if (peak == null) {
    // Already-full valid board — treat as trivial easy (adjacent_pair band).
    return { status: 'solved', peak: 'adjacent_pair', tier: 'easy' };
  }

  return {
    status: 'solved',
    peak,
    tier: peakToTier(peak),
  };
}

/** Peak→tier when solved; null when incomplete/budget. */
export function rateBinaryPeak(givens: number[][]): DifficultyTier | null {
  const result = rateBinary(givens);
  if (result.status !== 'solved') return null;
  return result.tier;
}
