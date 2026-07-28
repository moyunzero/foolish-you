import { initTechniqueBoard } from './candidates';
import {
  EXPERT_CHAIN_MAX_LENGTH,
  EXPERT_CHAIN_MAX_NODES,
  tryShortChain,
} from './chains';
import {
  maxTechnique,
  peakToTier,
  type SudokuTechnique,
} from './techniqueIds';
import {
  applyNextTechnique,
  isGridFull,
} from './techniques';
import type { DifficultyTier } from '../difficulty/tiers';

/** Re-export Expert chain caps for tests / generate-for-tier. */
export { EXPERT_CHAIN_MAX_LENGTH, EXPERT_CHAIN_MAX_NODES };

/** Total technique applications per rate call (D-04). */
export const EXPERT_MAX_TECHNIQUE_STEPS = 500;

export type RateSudokuResult =
  | {
      status: 'solved';
      peak: SudokuTechnique;
      tier: DifficultyTier;
    }
  | {
      status: 'incomplete';
      peak: SudokuTechnique | null;
    }
  | {
      status: 'budget_exhausted';
      peak: SudokuTechnique | null;
    };

function isValidGivens(givens: number[][]): boolean {
  if (!Array.isArray(givens) || givens.length !== 9) return false;
  for (let r = 0; r < 9; r += 1) {
    const row = givens[r];
    if (!Array.isArray(row) || row.length !== 9) return false;
    for (let c = 0; c < 9; c += 1) {
      const v = row[c];
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 9) {
        return false;
      }
    }
  }
  return true;
}

/** True when any row, column, or 3×3 box has a duplicate nonzero digit. */
function hasHouseConflicts(digits: number[][]): boolean {
  for (let r = 0; r < 9; r += 1) {
    const seen = new Set<number>();
    for (let c = 0; c < 9; c += 1) {
      const v = digits[r]![c]!;
      if (v === 0) continue;
      if (seen.has(v)) return true;
      seen.add(v);
    }
  }
  for (let c = 0; c < 9; c += 1) {
    const seen = new Set<number>();
    for (let r = 0; r < 9; r += 1) {
      const v = digits[r]![c]!;
      if (v === 0) continue;
      if (seen.has(v)) return true;
      seen.add(v);
    }
  }
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const seen = new Set<number>();
      for (let r = br; r < br + 3; r += 1) {
        for (let c = bc; c < bc + 3; c += 1) {
          const v = digits[r]![c]!;
          if (v === 0) continue;
          if (seen.has(v)) return true;
          seen.add(v);
        }
      }
    }
  }
  return false;
}

/**
 * SE-style human-technique rater: scan easiest→hardest, apply first hit,
 * track peak, restart until solved / stuck / step budget.
 * Never places via backtracking solver; step/node caps only (no wall-clock timers).
 */
export function rateSudoku(givens: number[][]): RateSudokuResult {
  if (!isValidGivens(givens)) {
    return { status: 'incomplete', peak: null };
  }

  const board = initTechniqueBoard(givens);
  let peak: SudokuTechnique | null = null;
  let steps = 0;

  while (!isGridFull(board)) {
    if (steps >= EXPERT_MAX_TECHNIQUE_STEPS) {
      return { status: 'budget_exhausted', peak };
    }
    steps += 1;

    const basic = applyNextTechnique(board);
    if (basic.applied) {
      peak = maxTechnique(peak, basic.technique);
      continue;
    }

    const chain = tryShortChain(board);
    if (chain.applied) {
      peak = maxTechnique(peak, chain.technique);
      continue;
    }
    if (chain.budgetExceeded) {
      return { status: 'budget_exhausted', peak };
    }

    return { status: 'incomplete', peak };
  }

  // Full digit grid is solved only when conflict-free (validate-only; no solver).
  if (hasHouseConflicts(board.digits)) {
    return { status: 'incomplete', peak };
  }

  if (peak == null) {
    // Already full grid (e.g. 81 givens) — treat as trivial easy
    return { status: 'solved', peak: 'full_house', tier: 'easy' };
  }

  return {
    status: 'solved',
    peak,
    tier: peakToTier(peak),
  };
}

/** Peak→tier when solved; null when incomplete/budget. */
export function rateSudokuPeak(givens: number[][]): DifficultyTier | null {
  const result = rateSudoku(givens);
  if (result.status !== 'solved') return null;
  return result.tier;
}
