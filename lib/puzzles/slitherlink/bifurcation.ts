import { clonePlayState } from './edges';
import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type EdgeCoord,
  type SlitherlinkPlayState,
} from './spec';
import { applyNextTechnique, hasUnknownEdge } from './techniques';
import { isPartialConsistent } from './validate';

/** Nested hypothesis depth for Expert bifurcation (D-18). */
export const SL_BIFURCATION_MAX_DEPTH = 2;

/** Branch expansions per rate call (D-18). */
export const SL_BIFURCATION_MAX_NODES = 600;

export type BifurcationResult =
  | { applied: true; technique: 'bifurcation' }
  | { applied: false; budgetExceeded: boolean };

type PropOutcome =
  | { kind: 'ok'; play: SlitherlinkPlayState }
  | { kind: 'contradiction' }
  | { kind: 'budget' };

function listUnknownEdges(play: SlitherlinkPlayState): EdgeCoord[] {
  const edges: EdgeCoord[] = [];
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (play.h[row]![col] === EDGE_UNKNOWN) {
        edges.push({ orientation: 'h', row, col });
      }
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (play.v[row]![col] === EDGE_UNKNOWN) {
        edges.push({ orientation: 'v', row, col });
      }
    }
  }
  return edges;
}

function setEdge(
  play: SlitherlinkPlayState,
  edge: EdgeCoord,
  state: typeof EDGE_LINE | typeof EDGE_BLANK,
): void {
  if (edge.orientation === 'h') play.h[edge.row]![edge.col] = state;
  else play.v[edge.row]![edge.col] = state;
}

/** Propagate Easy–Hard only (no nested bifurcation) under node budget. */
function propagateEasyHard(
  start: SlitherlinkPlayState,
  clues: (number | null)[][],
  nodes: { count: number },
): PropOutcome {
  const play = clonePlayState(start);
  while (hasUnknownEdge(play)) {
    nodes.count += 1;
    if (nodes.count > SL_BIFURCATION_MAX_NODES) {
      return { kind: 'budget' };
    }
    if (!isPartialConsistent(play, clues)) {
      return { kind: 'contradiction' };
    }
    const hit = applyNextTechnique(play, clues);
    if (!hit.applied) {
      if (!isPartialConsistent(play, clues)) return { kind: 'contradiction' };
      return { kind: 'ok', play };
    }
  }
  if (!isPartialConsistent(play, clues)) return { kind: 'contradiction' };
  return { kind: 'ok', play };
}

/**
 * Bounded Expert bifurcation: hypothesize LINE vs BLANK on an unknown edge,
 * propagate Easy–Hard. Force only when exactly one branch contradicts (CR-01).
 * Caps: depth + nodes only — never wall-clock.
 */
export function tryBifurcation(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
  depth = 0,
  nodes: { count: number } = { count: 0 },
): BifurcationResult {
  if (depth >= SL_BIFURCATION_MAX_DEPTH) {
    return { applied: false, budgetExceeded: false };
  }

  for (const edge of listUnknownEdges(play)) {
    nodes.count += 1;
    if (nodes.count > SL_BIFURCATION_MAX_NODES) {
      return { applied: false, budgetExceeded: true };
    }

    const outcomes: Array<'ok' | 'contradiction'> = [];

    for (const value of [EDGE_LINE, EDGE_BLANK] as const) {
      const trial = clonePlayState(play);
      setEdge(trial, edge, value);
      if (!isPartialConsistent(trial, clues)) {
        outcomes.push('contradiction');
        continue;
      }
      const prop = propagateEasyHard(trial, clues, nodes);
      if (prop.kind === 'budget') {
        return { applied: false, budgetExceeded: true };
      }
      outcomes.push(prop.kind === 'contradiction' ? 'contradiction' : 'ok');
    }

    const contraCount = outcomes.filter((o) => o === 'contradiction').length;
    const okCount = outcomes.filter((o) => o === 'ok').length;

    // Exactly one branch contradicts → force the surviving state.
    if (contraCount === 1 && okCount === 1) {
      const forced = outcomes[0] === 'ok' ? EDGE_LINE : EDGE_BLANK;
      setEdge(play, edge, forced);
      return { applied: true, technique: 'bifurcation' };
    }
  }

  return { applied: false, budgetExceeded: false };
}
