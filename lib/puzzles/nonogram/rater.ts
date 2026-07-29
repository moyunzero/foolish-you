import type { DifficultyTier } from '../difficulty/tiers';
import { createEmptyGrid } from './grid';
import { lineHasValidPlacement } from './lineSolver';
import {
  NONOGRAM_PROBE_MAX_DEPTH,
  NONOGRAM_PROBE_MAX_NODES,
  tryProbe,
} from './probe';
import {
  maxTechnique,
  peakToTier,
  type NonogramTechnique,
} from './techniqueIds';
import { clonePlayGrid, fullSettle, isGridFull } from './techniques';
import {
  NONOGRAM_COLS,
  NONOGRAM_ROWS,
  type NonogramCell,
} from './spec';

/** Re-export Expert probe caps for tests / freeze scripts. */
export { NONOGRAM_PROBE_MAX_DEPTH, NONOGRAM_PROBE_MAX_NODES };

/** FullSettle + sweepCount ≤ this → simple_few / Easy (D-01). */
export const NONOGRAM_EASY_MAX_SWEEPS = 3;

/** Total FullSettle/probe steps per rate call (D-01). */
export const NONOGRAM_MAX_TECHNIQUE_STEPS = 500;

/** Max productive probes before budget_exhausted (D-01 / D-26). */
export const NONOGRAM_MAX_PRODUCTIVE_PROBES = 8;

export type RateNonogramResult =
  | {
      status: 'solved';
      peak: NonogramTechnique;
      tier: DifficultyTier;
      sweepCount: number;
      probeCount: number;
    }
  | {
      status: 'incomplete';
      peak: NonogramTechnique | null;
    }
  | {
      status: 'budget_exhausted';
      peak: NonogramTechnique | null;
    };

function isValidClues(rowClues: number[][], colClues: number[][]): boolean {
  if (!Array.isArray(rowClues) || rowClues.length !== NONOGRAM_ROWS) {
    return false;
  }
  if (!Array.isArray(colClues) || colClues.length !== NONOGRAM_COLS) {
    return false;
  }
  for (const line of [...rowClues, ...colClues]) {
    if (!Array.isArray(line) || line.length === 0) return false;
    for (const n of line) {
      if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n > 8) {
        return false;
      }
    }
  }
  return true;
}

function gridHasImpossibleLine(
  grid: NonogramCell[][],
  rowClues: number[][],
  colClues: number[][],
): boolean {
  for (let r = 0; r < NONOGRAM_ROWS; r += 1) {
    if (!lineHasValidPlacement(grid[r]!, rowClues[r]!)) return true;
  }
  for (let c = 0; c < NONOGRAM_COLS; c += 1) {
    const col = grid.map((row) => row[c]!);
    if (!lineHasValidPlacement(col, colClues[c]!)) return true;
  }
  return false;
}

function peakFromSimple(sweepCount: number): NonogramTechnique {
  return sweepCount <= NONOGRAM_EASY_MAX_SWEEPS ? 'simple_few' : 'simple_many';
}

function peakFromProbes(
  probeCount: number,
  maxDepth: number,
): NonogramTechnique {
  if (probeCount >= 2 || maxDepth >= 2) return 'nested_probe';
  return 'probe';
}

/**
 * Logical Nonogram rater: FullSettle (H-first) then bounded productive probes.
 * Never places via whole-board backtracking; step/node/probe caps only (no wall-clock).
 */
export function rateNonogram(
  rowClues: number[][],
  colClues: number[][],
  initialGrid?: NonogramCell[][],
): RateNonogramResult {
  if (!isValidClues(rowClues, colClues)) {
    return { status: 'incomplete', peak: null };
  }

  const grid =
    initialGrid != null
      ? clonePlayGrid(initialGrid)
      : createEmptyGrid(NONOGRAM_ROWS, NONOGRAM_COLS);

  if (grid.length !== NONOGRAM_ROWS) {
    return { status: 'incomplete', peak: null };
  }
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== NONOGRAM_COLS) {
      return { status: 'incomplete', peak: null };
    }
  }

  if (gridHasImpossibleLine(grid, rowClues, colClues)) {
    return { status: 'incomplete', peak: null };
  }

  let peak: NonogramTechnique | null = null;
  let steps = 0;
  let sweepCount = 0;
  let probeCount = 0;
  let maxDepth = 0;
  const probeNodes = { count: 0 };

  steps += 1;
  if (steps > NONOGRAM_MAX_TECHNIQUE_STEPS) {
    return { status: 'budget_exhausted', peak };
  }

  const first = fullSettle(grid, rowClues, colClues);
  sweepCount = first.sweepCount;

  if (first.solved && isGridFull(grid)) {
    const simplePeak = peakFromSimple(sweepCount);
    return {
      status: 'solved',
      peak: simplePeak,
      tier: peakToTier(simplePeak),
      sweepCount,
      probeCount: 0,
    };
  }

  peak = maxTechnique(peak, peakFromSimple(sweepCount));

  while (!isGridFull(grid)) {
    if (steps >= NONOGRAM_MAX_TECHNIQUE_STEPS) {
      return { status: 'budget_exhausted', peak };
    }
    if (probeCount >= NONOGRAM_MAX_PRODUCTIVE_PROBES) {
      return { status: 'budget_exhausted', peak };
    }
    steps += 1;

    if (gridHasImpossibleLine(grid, rowClues, colClues)) {
      return { status: 'incomplete', peak };
    }

    const probe = tryProbe(grid, rowClues, colClues, 0, probeNodes);
    if (probe.applied) {
      probeCount += 1;
      maxDepth = Math.max(maxDepth, probe.depth);
      peak = maxTechnique(peak, peakFromProbes(probeCount, maxDepth));

      steps += 1;
      if (steps > NONOGRAM_MAX_TECHNIQUE_STEPS) {
        return { status: 'budget_exhausted', peak };
      }
      const after = fullSettle(grid, rowClues, colClues);
      sweepCount += after.sweepCount;
      continue;
    }
    if (probe.budgetExceeded) {
      return { status: 'budget_exhausted', peak };
    }

    return { status: 'incomplete', peak };
  }

  if (gridHasImpossibleLine(grid, rowClues, colClues)) {
    return { status: 'incomplete', peak };
  }

  if (probeCount === 0) {
    const simplePeak = peakFromSimple(sweepCount);
    return {
      status: 'solved',
      peak: simplePeak,
      tier: peakToTier(simplePeak),
      sweepCount,
      probeCount: 0,
    };
  }

  const probePeak = peakFromProbes(probeCount, maxDepth);
  return {
    status: 'solved',
    peak: probePeak,
    tier: peakToTier(probePeak),
    sweepCount,
    probeCount,
  };
}

/** Peak→tier when solved; null when incomplete/budget. */
export function rateNonogramPeak(
  rowClues: number[][],
  colClues: number[][],
): DifficultyTier | null {
  const result = rateNonogram(rowClues, colClues);
  if (result.status !== 'solved') return null;
  return result.tier;
}
