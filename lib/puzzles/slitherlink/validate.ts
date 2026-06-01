import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type SlitherlinkPlayState,
  type SlitherlinkPuzzle,
} from './spec';
import {
  clonePlayState,
  lineCountAroundCell,
  pointDegree,
  unknownCountAroundCell,
} from './edges';

function cellHasFourLines(play: SlitherlinkPlayState, row: number, col: number): boolean {
  return lineCountAroundCell(play, row, col) === 4;
}

function hasCellFourLineViolation(play: SlitherlinkPlayState): boolean {
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (cellHasFourLines(play, row, col)) return true;
    }
  }
  return false;
}

function clueViolated(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
  row: number,
  col: number,
): boolean {
  const clue = clues[row][col];
  if (clue == null) return false;

  const lines = lineCountAroundCell(play, row, col);
  const unknowns = unknownCountAroundCell(play, row, col);

  if (lines > clue) return true;
  if (unknowns === 0 && lines !== clue) return true;
  return false;
}

function hasClueViolation(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): boolean {
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (clueViolated(play, clues, row, col)) return true;
    }
  }
  return false;
}

function hasPointDegreeViolation(play: SlitherlinkPlayState): boolean {
  for (let pr = 0; pr <= SLITHERLINK_SIZE; pr += 1) {
    for (let pc = 0; pc <= SLITHERLINK_SIZE; pc += 1) {
      if (pointDegree(play, pr, pc) > 2) return true;
    }
  }
  return false;
}

function countLineEdges(play: SlitherlinkPlayState): number {
  let count = 0;
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (play.h[row][col] === EDGE_LINE) count += 1;
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (play.v[row][col] === EDGE_LINE) count += 1;
    }
  }
  return count;
}

function hasUnknownEdge(play: SlitherlinkPlayState): boolean {
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (play.h[row][col] === EDGE_UNKNOWN) return true;
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (play.v[row][col] === EDGE_UNKNOWN) return true;
    }
  }
  return false;
}

function countOpenPathEndpoints(play: SlitherlinkPlayState): number {
  let endpoints = 0;
  for (let pr = 0; pr <= SLITHERLINK_SIZE; pr += 1) {
    for (let pc = 0; pc <= SLITHERLINK_SIZE; pc += 1) {
      const degree = pointDegree(play, pr, pc);
      if (degree === 1) endpoints += 1;
    }
  }
  return endpoints;
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

function lineEdgeKey(edge: LineEdgeRef): string {
  return `${edge.kind}:${edge.row},${edge.col}`;
}

function pointsForLineEdge(edge: LineEdgeRef): [string, string] {
  if (edge.kind === 'h') {
    return [`${edge.row},${edge.col}`, `${edge.row},${edge.col + 1}`];
  }
  return [`${edge.row},${edge.col}`, `${edge.row + 1},${edge.col}`];
}

/** True when all LINE edges belong to one connected line graph (single loop). */
function isLineGraphOneComponent(play: SlitherlinkPlayState): boolean {
  const edges = collectLineEdges(play);
  if (edges.length === 0) return false;

  const edgesByPoint = new Map<string, LineEdgeRef[]>();
  for (const edge of edges) {
    for (const point of pointsForLineEdge(edge)) {
      const list = edgesByPoint.get(point) ?? [];
      list.push(edge);
      edgesByPoint.set(point, list);
    }
  }

  const visited = new Set<string>();
  const queue: LineEdgeRef[] = [edges[0]];
  visited.add(lineEdgeKey(edges[0]));

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const point of pointsForLineEdge(current)) {
      const neighbors = edgesByPoint.get(point) ?? [];
      for (const next of neighbors) {
        const key = lineEdgeKey(next);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push(next);
      }
    }
  }

  return visited.size === edges.length;
}

function isSingleLoopComplete(play: SlitherlinkPlayState): boolean {
  if (hasUnknownEdge(play)) return false;
  if (hasPointDegreeViolation(play)) return false;
  if (hasCellFourLineViolation(play)) return false;

  const lineCount = countLineEdges(play);
  if (lineCount === 0) return false;

  if (countOpenPathEndpoints(play) !== 0) return false;

  for (let pr = 0; pr <= SLITHERLINK_SIZE; pr += 1) {
    for (let pc = 0; pc <= SLITHERLINK_SIZE; pc += 1) {
      const degree = pointDegree(play, pr, pc);
      if (degree !== 0 && degree !== 2) return false;
    }
  }

  if (!isLineGraphOneComponent(play)) return false;

  return true;
}

/** Partial assignment consistency for solver / generator. */
export function isPartialConsistent(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): boolean {
  if (hasPointDegreeViolation(play)) return false;
  if (hasCellFourLineViolation(play)) return false;
  if (hasClueViolation(play, clues)) return false;

  const endpoints = countOpenPathEndpoints(play);
  if (endpoints > 2) return false;

  return true;
}

function normalizeUnknownToBlank(play: SlitherlinkPlayState): SlitherlinkPlayState {
  const normalized = clonePlayState(play);

  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (normalized.h[row][col] === EDGE_UNKNOWN) {
        normalized.h[row][col] = EDGE_BLANK;
      }
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (normalized.v[row][col] === EDGE_UNKNOWN) {
        normalized.v[row][col] = EDGE_BLANK;
      }
    }
  }

  return normalized;
}

export function isCompleteAndValid(
  play: SlitherlinkPlayState,
  puzzle: Pick<SlitherlinkPuzzle, 'clues'>,
): boolean {
  const normalized = normalizeUnknownToBlank(play);

  if (!isPartialConsistent(normalized, puzzle.clues)) return false;
  if (!isSingleLoopComplete(normalized)) return false;

  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      const clue = puzzle.clues[row][col];
      if (clue == null) continue;
      if (lineCountAroundCell(normalized, row, col) !== clue) return false;
    }
  }

  return true;
}

function markClueConflictEdges(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
  conflicts: { h: boolean[][]; v: boolean[][] },
): void {
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (!clueViolated(play, clues, row, col)) continue;
      conflicts.h[row][col] = true;
      conflicts.h[row + 1][col] = true;
      conflicts.v[row][col] = true;
      conflicts.v[row][col + 1] = true;
    }
  }
}

function markPointDegreeConflictEdges(
  play: SlitherlinkPlayState,
  conflicts: { h: boolean[][]; v: boolean[][] },
): void {
  for (let pr = 0; pr <= SLITHERLINK_SIZE; pr += 1) {
    for (let pc = 0; pc <= SLITHERLINK_SIZE; pc += 1) {
      if (pointDegree(play, pr, pc) <= 2) continue;
      if (pc > 0 && play.h[pr][pc - 1] === EDGE_LINE) conflicts.h[pr][pc - 1] = true;
      if (pc < SLITHERLINK_SIZE && play.h[pr][pc] === EDGE_LINE) conflicts.h[pr][pc] = true;
      if (pr > 0 && play.v[pr - 1][pc] === EDGE_LINE) conflicts.v[pr - 1][pc] = true;
      if (pr < SLITHERLINK_SIZE && play.v[pr][pc] === EDGE_LINE) conflicts.v[pr][pc] = true;
    }
  }
}

function markCellFourLineConflictEdges(
  play: SlitherlinkPlayState,
  conflicts: { h: boolean[][]; v: boolean[][] },
): void {
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (!cellHasFourLines(play, row, col)) continue;
      conflicts.h[row][col] = true;
      conflicts.h[row + 1][col] = true;
      conflicts.v[row][col] = true;
      conflicts.v[row][col + 1] = true;
    }
  }
}

export function createConflictMask(): { h: boolean[][]; v: boolean[][] } {
  return {
    h: Array.from({ length: SLITHERLINK_SIZE + 1 }, () =>
      Array<boolean>(SLITHERLINK_SIZE).fill(false),
    ),
    v: Array.from({ length: SLITHERLINK_SIZE }, () =>
      Array<boolean>(SLITHERLINK_SIZE + 1).fill(false),
    ),
  };
}

export function getConflictEdges(
  play: SlitherlinkPlayState,
  puzzle: Pick<SlitherlinkPuzzle, 'clues'>,
): { h: boolean[][]; v: boolean[][] } {
  const conflicts = createConflictMask();
  markClueConflictEdges(play, puzzle.clues, conflicts);
  markPointDegreeConflictEdges(play, conflicts);
  markCellFourLineConflictEdges(play, conflicts);
  return conflicts;
}

function propagatePointEdges(play: SlitherlinkPlayState): boolean {
  let changed = false;

  for (let pr = 0; pr <= SLITHERLINK_SIZE; pr += 1) {
    for (let pc = 0; pc <= SLITHERLINK_SIZE; pc += 1) {
      const incident = [
        pc > 0 ? { orientation: 'h' as const, row: pr, col: pc - 1 } : null,
        pc < SLITHERLINK_SIZE ? { orientation: 'h' as const, row: pr, col: pc } : null,
        pr > 0 ? { orientation: 'v' as const, row: pr - 1, col: pc } : null,
        pr < SLITHERLINK_SIZE ? { orientation: 'v' as const, row: pr, col: pc } : null,
      ].filter((edge): edge is { orientation: 'h' | 'v'; row: number; col: number } => edge != null);

      let lineCount = 0;
      const unknownEdges: typeof incident = [];

      for (const edge of incident) {
        const state =
          edge.orientation === 'h'
            ? play.h[edge.row][edge.col]
            : play.v[edge.row][edge.col];
        if (state === EDGE_LINE) lineCount += 1;
        else if (state === EDGE_UNKNOWN) unknownEdges.push(edge);
      }

      if (lineCount === 2) {
        for (const edge of unknownEdges) {
          if (edge.orientation === 'h') play.h[edge.row][edge.col] = EDGE_BLANK;
          else play.v[edge.row][edge.col] = EDGE_BLANK;
          changed = true;
        }
      } else if (lineCount === 1 && unknownEdges.length === 1) {
        const edge = unknownEdges[0];
        if (edge.orientation === 'h') play.h[edge.row][edge.col] = EDGE_LINE;
        else play.v[edge.row][edge.col] = EDGE_LINE;
        changed = true;
      }
    }
  }

  return changed;
}

export function runPropagation(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): boolean {
  let progressed = false;
  let changed = true;
  while (changed) {
    changed = propagateForcedEdges(play, clues) || propagatePointEdges(play);
    if (changed) progressed = true;
    if (!isPartialConsistent(play, clues)) return false;
  }
  return progressed;
}

export function propagateForcedEdges(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): boolean {
  let changed = false;

  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      const clue = clues[row][col];
      if (clue == null) continue;

      const edges = [
        { orientation: 'h' as const, row, col },
        { orientation: 'h' as const, row: row + 1, col },
        { orientation: 'v' as const, row, col },
        { orientation: 'v' as const, row, col: col + 1 },
      ];

      if (clue === 0) {
        for (const edge of edges) {
          const current =
            edge.orientation === 'h'
              ? play.h[edge.row][edge.col]
              : play.v[edge.row][edge.col];
          if (current === EDGE_BLANK) continue;
          if (current === EDGE_LINE) return false;
          if (edge.orientation === 'h') play.h[edge.row][edge.col] = EDGE_BLANK;
          else play.v[edge.row][edge.col] = EDGE_BLANK;
          changed = true;
        }
      }

      const lines = lineCountAroundCell(play, row, col);
      const unknowns = unknownCountAroundCell(play, row, col);

      if (lines + unknowns === clue) {
        for (const edge of edges) {
          const current =
            edge.orientation === 'h'
              ? play.h[edge.row][edge.col]
              : play.v[edge.row][edge.col];
          if (current !== EDGE_UNKNOWN) continue;
          if (edge.orientation === 'h') play.h[edge.row][edge.col] = EDGE_LINE;
          else play.v[edge.row][edge.col] = EDGE_LINE;
          changed = true;
        }
      }

      if (lines === clue) {
        for (const edge of edges) {
          const current =
            edge.orientation === 'h'
              ? play.h[edge.row][edge.col]
              : play.v[edge.row][edge.col];
          if (current !== EDGE_UNKNOWN) continue;
          if (edge.orientation === 'h') play.h[edge.row][edge.col] = EDGE_BLANK;
          else play.v[edge.row][edge.col] = EDGE_BLANK;
          changed = true;
        }
      }
    }
  }

  return changed;
}

export function cloneForSolver(play: SlitherlinkPlayState): SlitherlinkPlayState {
  return clonePlayState(play);
}

export { isSingleLoopComplete, hasUnknownEdge };
