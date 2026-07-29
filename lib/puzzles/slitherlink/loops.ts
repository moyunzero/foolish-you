import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type EdgeCoord,
  type SlitherlinkPlayState,
} from './spec';
import { edgesAtPoint, pointDegree } from './edges';

type TechniqueResult =
  | { applied: true; technique: 'vertex_degree' | 'local_loop' | 'zero_elim' }
  | { applied: false };

const MISS: TechniqueResult = { applied: false };

function setEdge(
  play: SlitherlinkPlayState,
  edge: EdgeCoord,
  state: typeof EDGE_LINE | typeof EDGE_BLANK,
): void {
  if (edge.orientation === 'h') play.h[edge.row][edge.col] = state;
  else play.v[edge.row][edge.col] = state;
}

function edgeState(play: SlitherlinkPlayState, edge: EdgeCoord): number {
  return edge.orientation === 'h'
    ? play.h[edge.row][edge.col]
    : play.v[edge.row][edge.col];
}

/**
 * Easy-band helper: degree 0 with one unknown left → blank.
 * Reported as zero_elim (impossible-edge elim) — not Medium edge_count.
 */
export function tryDegreeZeroBlank(play: SlitherlinkPlayState): TechniqueResult {
  for (let pr = 0; pr <= SLITHERLINK_SIZE; pr += 1) {
    for (let pc = 0; pc <= SLITHERLINK_SIZE; pc += 1) {
      const incident = edgesAtPoint(play, pr, pc);
      let lineCount = 0;
      const unknownEdges: EdgeCoord[] = [];

      for (const edge of incident) {
        const state = edgeState(play, edge);
        if (state === EDGE_LINE) lineCount += 1;
        else if (state === EDGE_UNKNOWN) unknownEdges.push(edge);
      }

      if (lineCount === 0 && unknownEdges.length === 1) {
        setEdge(play, unknownEdges[0]!, EDGE_BLANK);
        return { applied: true, technique: 'zero_elim' };
      }
    }
  }
  return MISS;
}

/**
 * Hard: vertex degree 1/2 forcing — one edge per hit (D-24).
 * degree 2 LINE → remaining UNKNOWN become BLANK;
 * degree 1 LINE + exactly 1 UNKNOWN → that UNKNOWN becomes LINE.
 */
export function tryVertexDegree(play: SlitherlinkPlayState): TechniqueResult {
  for (let pr = 0; pr <= SLITHERLINK_SIZE; pr += 1) {
    for (let pc = 0; pc <= SLITHERLINK_SIZE; pc += 1) {
      const incident = edgesAtPoint(play, pr, pc);
      let lineCount = 0;
      const unknownEdges: EdgeCoord[] = [];

      for (const edge of incident) {
        const state = edgeState(play, edge);
        if (state === EDGE_LINE) lineCount += 1;
        else if (state === EDGE_UNKNOWN) unknownEdges.push(edge);
      }

      if (lineCount === 2 && unknownEdges.length > 0) {
        setEdge(play, unknownEdges[0]!, EDGE_BLANK);
        return { applied: true, technique: 'vertex_degree' };
      }

      if (lineCount === 1 && unknownEdges.length === 1) {
        setEdge(play, unknownEdges[0]!, EDGE_LINE);
        return { applied: true, technique: 'vertex_degree' };
      }
    }
  }
  return MISS;
}

type LineEdgeRef = { kind: 'h' | 'v'; row: number; col: number };

function collectLineEdges(play: SlitherlinkPlayState): LineEdgeRef[] {
  const edges: LineEdgeRef[] = [];
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (play.h[row][col] === EDGE_LINE) edges.push({ kind: 'h', row, col });
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (play.v[row][col] === EDGE_LINE) edges.push({ kind: 'v', row, col });
    }
  }
  return edges;
}

function pointsFor(edge: LineEdgeRef): [string, string] {
  if (edge.kind === 'h') {
    return [`${edge.row},${edge.col}`, `${edge.row},${edge.col + 1}`];
  }
  return [`${edge.row},${edge.col}`, `${edge.row + 1},${edge.col}`];
}

function pointsForCoord(edge: EdgeCoord): [string, string] {
  return pointsFor({
    kind: edge.orientation,
    row: edge.row,
    col: edge.col,
  });
}

/** Same connected LINE component as start (BFS over line graph). */
function lineComponentPoints(
  play: SlitherlinkPlayState,
  start: string,
): Set<string> {
  const lines = collectLineEdges(play);
  const byPoint = new Map<string, LineEdgeRef[]>();
  for (const edge of lines) {
    for (const p of pointsFor(edge)) {
      const list = byPoint.get(p) ?? [];
      list.push(edge);
      byPoint.set(p, list);
    }
  }

  const seen = new Set<string>();
  const queue = [start];
  seen.add(start);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const edge of byPoint.get(cur) ?? []) {
      for (const p of pointsFor(edge)) {
        if (seen.has(p)) continue;
        seen.add(p);
        queue.push(p);
      }
    }
  }
  return seen;
}

function hasUnknownElsewhere(
  play: SlitherlinkPlayState,
  skip: EdgeCoord,
): boolean {
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (
        play.h[row][col] === EDGE_UNKNOWN &&
        !(skip.orientation === 'h' && skip.row === row && skip.col === col)
      ) {
        return true;
      }
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (
        play.v[row][col] === EDGE_UNKNOWN &&
        !(skip.orientation === 'v' && skip.row === row && skip.col === col)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Hard: forbid premature small loop — if marking an UNKNOWN as LINE would
 * close a path into a loop while other UNKNOWN edges remain, force BLANK.
 * Local only — no Jordan/region coloring (CONTEXT Discretion).
 */
export function tryLocalLoop(play: SlitherlinkPlayState): TechniqueResult {
  const candidates: EdgeCoord[] = [];
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (play.h[row][col] === EDGE_UNKNOWN) {
        candidates.push({ orientation: 'h', row, col });
      }
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (play.v[row][col] === EDGE_UNKNOWN) {
        candidates.push({ orientation: 'v', row, col });
      }
    }
  }

  for (const edge of candidates) {
    if (!hasUnknownElsewhere(play, edge)) continue;

    const [a, b] = pointsForCoord(edge);
    const [ar, ac] = a.split(',').map(Number) as [number, number];
    const [br, bc] = b.split(',').map(Number) as [number, number];

    // Premature close: both endpoints are degree-1 and already on the same path.
    if (pointDegree(play, ar, ac) !== 1) continue;
    if (pointDegree(play, br, bc) !== 1) continue;

    const component = lineComponentPoints(play, a);
    if (!component.has(b)) continue;

    setEdge(play, edge, EDGE_BLANK);
    return { applied: true, technique: 'local_loop' };
  }

  return MISS;
}
