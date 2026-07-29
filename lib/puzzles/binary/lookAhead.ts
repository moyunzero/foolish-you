import { clonePlayGrid, applyNextTechnique, isGridFull } from './techniques';
import { getViolationCells } from './validate';
import { BINARY_EMPTY, BINARY_ONE, BINARY_ZERO } from './grid';
import { BINARY_SIZE } from './spec';

/** Nested hypothesis depth for Expert look_ahead (D-18). */
export const BINARY_LOOKAHEAD_MAX_DEPTH = 2;

/** Hypothesis expansions per rate call (D-18). */
export const BINARY_LOOKAHEAD_MAX_NODES = 800;

export type LookAheadResult =
  | { applied: true; technique: 'look_ahead' }
  | { applied: false; budgetExceeded: boolean };

type PropOutcome =
  | { kind: 'ok'; grid: number[][] }
  | { kind: 'contradiction' }
  | { kind: 'budget' };

function propagateEasyHard(
  start: number[][],
  nodes: { count: number },
): PropOutcome {
  const grid = clonePlayGrid(start);
  // Bound Easy–Hard prop steps by remaining node budget.
  while (!isGridFull(grid)) {
    nodes.count += 1;
    if (nodes.count > BINARY_LOOKAHEAD_MAX_NODES) {
      return { kind: 'budget' };
    }
    if (getViolationCells(grid).length > 0) {
      return { kind: 'contradiction' };
    }
    const hit = applyNextTechnique(grid);
    if (!hit.applied) {
      if (getViolationCells(grid).length > 0) return { kind: 'contradiction' };
      return { kind: 'ok', grid };
    }
  }
  if (getViolationCells(grid).length > 0) return { kind: 'contradiction' };
  return { kind: 'ok', grid };
}

/**
 * Bounded Expert look_ahead: hypothesize a cell value, propagate Easy–Hard.
 * Force only when exactly one branch contradicts (CR-01 / D-27).
 * Caps: depth + nodes only — never wall-clock.
 */
export function tryLookAhead(
  grid: number[][],
  depth = 0,
  nodes: { count: number } = { count: 0 },
): LookAheadResult {
  if (depth >= BINARY_LOOKAHEAD_MAX_DEPTH) {
    return { applied: false, budgetExceeded: false };
  }

  for (let r = 0; r < BINARY_SIZE; r += 1) {
    for (let c = 0; c < BINARY_SIZE; c += 1) {
      if (grid[r]![c] !== BINARY_EMPTY) continue;

      nodes.count += 1;
      if (nodes.count > BINARY_LOOKAHEAD_MAX_NODES) {
        return { applied: false, budgetExceeded: true };
      }

      const outcomes: Array<'ok' | 'contradiction'> = [];

      for (const value of [BINARY_ZERO, BINARY_ONE]) {
        const trial = clonePlayGrid(grid);
        trial[r]![c] = value;
        if (getViolationCells(trial).length > 0) {
          outcomes.push('contradiction');
          continue;
        }
        const prop = propagateEasyHard(trial, nodes);
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
          outcomes[0] === 'ok' ? BINARY_ZERO : BINARY_ONE;
        grid[r]![c] = forced;
        return { applied: true, technique: 'look_ahead' };
      }
    }
  }

  return { applied: false, budgetExceeded: false };
}
