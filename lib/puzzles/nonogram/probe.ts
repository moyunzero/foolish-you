import { lineHasValidPlacement } from './lineSolver';
import { clonePlayGrid, fullSettle } from './techniques';
import {
  NONOGRAM_COLS,
  NONOGRAM_CROSS,
  NONOGRAM_EMPTY,
  NONOGRAM_FILL,
  NONOGRAM_ROWS,
  type NonogramCell,
} from './spec';

/** Nested hypothesis depth for Expert probe (D-01). */
export const NONOGRAM_PROBE_MAX_DEPTH = 2;

/** Hypothesis expansions per rate call (D-01). */
export const NONOGRAM_PROBE_MAX_NODES = 800;

export type ProbeResult =
  | {
      applied: true;
      /** Depth of this productive force (0 = top-level). */
      depth: number;
    }
  | { applied: false; budgetExceeded: boolean };

type PropOutcome =
  | { kind: 'ok'; grid: NonogramCell[][] }
  | { kind: 'contradiction' }
  | { kind: 'budget' };

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

function propagateFullSettle(
  start: NonogramCell[][],
  rowClues: number[][],
  colClues: number[][],
  nodes: { count: number },
): PropOutcome {
  nodes.count += 1;
  if (nodes.count > NONOGRAM_PROBE_MAX_NODES) {
    return { kind: 'budget' };
  }

  if (gridHasImpossibleLine(start, rowClues, colClues)) {
    return { kind: 'contradiction' };
  }

  const grid = clonePlayGrid(start);
  fullSettle(grid, rowClues, colClues);

  if (gridHasImpossibleLine(grid, rowClues, colClues)) {
    return { kind: 'contradiction' };
  }

  return { kind: 'ok', grid };
}

/**
 * Bounded cell probe: row-major unknowns; try FILL then CROSS; FullSettle after each.
 * Force only when exactly one branch contradicts (CR-01).
 * Caps: depth + nodes only — never wall-clock.
 *
 * Depth gate mirrors Binary lookAhead: refuse to enter when depth >= max.
 * Nested depth≥2 forces are reserved for a future deepen path; Expert today
 * primarily comes from probeCount ≥ 2 in the rater loop (D-01).
 */
export function tryProbe(
  grid: NonogramCell[][],
  rowClues: number[][],
  colClues: number[][],
  depth = 0,
  nodes: { count: number } = { count: 0 },
): ProbeResult {
  if (depth >= NONOGRAM_PROBE_MAX_DEPTH) {
    return { applied: false, budgetExceeded: false };
  }

  for (let r = 0; r < NONOGRAM_ROWS; r += 1) {
    for (let c = 0; c < NONOGRAM_COLS; c += 1) {
      if (grid[r]![c] !== NONOGRAM_EMPTY) continue;

      nodes.count += 1;
      if (nodes.count > NONOGRAM_PROBE_MAX_NODES) {
        return { applied: false, budgetExceeded: true };
      }

      const outcomes: Array<'ok' | 'contradiction'> = [];

      for (const value of [NONOGRAM_FILL, NONOGRAM_CROSS] as const) {
        const trial = clonePlayGrid(grid);
        trial[r]![c] = value;
        const prop = propagateFullSettle(trial, rowClues, colClues, nodes);
        if (prop.kind === 'budget') {
          return { applied: false, budgetExceeded: true };
        }
        outcomes.push(prop.kind === 'contradiction' ? 'contradiction' : 'ok');
      }

      const contraCount = outcomes.filter((o) => o === 'contradiction').length;
      const okCount = outcomes.filter((o) => o === 'ok').length;

      // Exactly one branch contradicts → force the surviving value.
      if (contraCount === 1 && okCount === 1) {
        const forced =
          outcomes[0] === 'ok' ? NONOGRAM_FILL : NONOGRAM_CROSS;
        grid[r]![c] = forced;
        return { applied: true, depth };
      }
    }
  }

  return { applied: false, budgetExceeded: false };
}
