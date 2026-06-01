import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type EdgeCoord,
  type EdgeOrientation,
  type EdgeState,
  type SlitherlinkPlayState,
  type SlitherlinkSolutionEdges,
} from './spec';

export function createEmptyPlayState(): SlitherlinkPlayState {
  return {
    h: Array.from({ length: SLITHERLINK_SIZE + 1 }, () =>
      Array<EdgeState>(SLITHERLINK_SIZE).fill(EDGE_UNKNOWN),
    ),
    v: Array.from({ length: SLITHERLINK_SIZE }, () =>
      Array<EdgeState>(SLITHERLINK_SIZE + 1).fill(EDGE_UNKNOWN),
    ),
  };
}

export function createBlankSolution(): SlitherlinkSolutionEdges {
  return {
    h: Array.from({ length: SLITHERLINK_SIZE + 1 }, () =>
      Array<EdgeState>(SLITHERLINK_SIZE).fill(EDGE_BLANK),
    ),
    v: Array.from({ length: SLITHERLINK_SIZE }, () =>
      Array<EdgeState>(SLITHERLINK_SIZE + 1).fill(EDGE_BLANK),
    ),
  };
}

export function clonePlayState(play: SlitherlinkPlayState): SlitherlinkPlayState {
  return {
    h: play.h.map((row) => [...row]),
    v: play.v.map((row) => [...row]),
  };
}

export function cloneSolutionEdges(
  solution: SlitherlinkSolutionEdges,
): SlitherlinkSolutionEdges {
  return clonePlayState(solution);
}

/** Tap: 空/无 → 连线 → × → 无. Long-press: 空 (EDGE_UNKNOWN). */
export function cycleEdgeState(state: EdgeState): EdgeState {
  if (state === EDGE_UNKNOWN) return EDGE_LINE;
  if (state === EDGE_LINE) return EDGE_BLANK;
  return EDGE_UNKNOWN;
}

export function edgeAt(
  play: SlitherlinkPlayState,
  orientation: EdgeOrientation,
  row: number,
  col: number,
): EdgeState {
  return orientation === 'h' ? play.h[row][col] : play.v[row][col];
}

export function setEdgeAt(
  play: SlitherlinkPlayState,
  orientation: EdgeOrientation,
  row: number,
  col: number,
  state: EdgeState,
): void {
  if (orientation === 'h') play.h[row][col] = state;
  else play.v[row][col] = state;
}

export function edgesAroundCell(
  play: SlitherlinkPlayState,
  row: number,
  col: number,
): [EdgeState, EdgeState, EdgeState, EdgeState] {
  return [play.h[row][col], play.h[row + 1][col], play.v[row][col], play.v[row][col + 1]];
}

export function lineCountAroundCell(
  play: SlitherlinkPlayState,
  row: number,
  col: number,
): number {
  return edgesAroundCell(play, row, col).filter((state) => state === EDGE_LINE).length;
}

export function unknownCountAroundCell(
  play: SlitherlinkPlayState,
  row: number,
  col: number,
): number {
  return edgesAroundCell(play, row, col).filter((state) => state === EDGE_UNKNOWN).length;
}

export function pointDegree(play: SlitherlinkPlayState, pr: number, pc: number): number {
  let degree = 0;
  if (pc > 0 && play.h[pr][pc - 1] === EDGE_LINE) degree += 1;
  if (pc < SLITHERLINK_SIZE && play.h[pr][pc] === EDGE_LINE) degree += 1;
  if (pr > 0 && play.v[pr - 1][pc] === EDGE_LINE) degree += 1;
  if (pr < SLITHERLINK_SIZE && play.v[pr][pc] === EDGE_LINE) degree += 1;
  return degree;
}

export function edgesAtPoint(
  play: SlitherlinkPlayState,
  pr: number,
  pc: number,
): EdgeCoord[] {
  const edges: EdgeCoord[] = [];
  if (pc > 0) edges.push({ orientation: 'h', row: pr, col: pc - 1 });
  if (pc < SLITHERLINK_SIZE) edges.push({ orientation: 'h', row: pr, col: pc });
  if (pr > 0) edges.push({ orientation: 'v', row: pr - 1, col: pc });
  if (pr < SLITHERLINK_SIZE) edges.push({ orientation: 'v', row: pr, col: pc });
  return edges;
}

export function cluesFromSolutionEdges(
  solution: SlitherlinkSolutionEdges,
): (number | null)[][] {
  const clues: (number | null)[][] = Array.from({ length: SLITHERLINK_SIZE }, () =>
    Array<number | null>(SLITHERLINK_SIZE).fill(null),
  );

  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      clues[row][col] = lineCountAroundCell(solution, row, col);
    }
  }

  return clues;
}

export function listAllEdgeCoords(): EdgeCoord[] {
  const edges: EdgeCoord[] = [];
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      edges.push({ orientation: 'h', row, col });
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      edges.push({ orientation: 'v', row, col });
    }
  }
  return edges;
}

export function shuffleEdgeCoords(edges: EdgeCoord[], rng: () => number): EdgeCoord[] {
  const copy = [...edges];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function countClueCells(clues: (number | null)[][]): number {
  let count = 0;
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (clues[row][col] != null) count += 1;
    }
  }
  return count;
}

export function shuffleCellCoords(
  rng: () => number,
): { row: number; col: number }[] {
  const coords: { row: number; col: number }[] = [];
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      coords.push({ row, col });
    }
  }
  for (let i = coords.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [coords[i], coords[j]] = [coords[j], coords[i]];
  }
  return coords;
}
