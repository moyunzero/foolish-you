import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type EdgeCoord,
  type SlitherlinkPlayState,
} from './spec';
import {
  clonePlayState,
  createEmptyPlayState,
  edgeAt,
  listAllEdgeCoords,
  setEdgeAt,
  lineCountAroundCell,
  unknownCountAroundCell,
} from './edges';
import {
  isPartialConsistent,
  isSingleLoopComplete,
  runPropagation,
} from './validate';

function cellsForEdge(edge: EdgeCoord): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  if (edge.orientation === 'h') {
    if (edge.row > 0) cells.push({ row: edge.row - 1, col: edge.col });
    if (edge.row < SLITHERLINK_SIZE) cells.push({ row: edge.row, col: edge.col });
  } else {
    if (edge.col > 0) cells.push({ row: edge.row, col: edge.col - 1 });
    if (edge.col < SLITHERLINK_SIZE) cells.push({ row: edge.row, col: edge.col });
  }
  return cells;
}

function findBranchEdge(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): EdgeCoord | null {
  let best: EdgeCoord | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const edge of listAllEdgeCoords()) {
    if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) continue;

    let minSlack = Number.POSITIVE_INFINITY;
    for (const { row, col } of cellsForEdge(edge)) {
      const clue = clues[row][col];
      if (clue == null) continue;
      const lines = lineCountAroundCell(play, row, col);
      const unknowns = unknownCountAroundCell(play, row, col);
      const slack = unknowns - (clue - lines);
      minSlack = Math.min(minSlack, slack);
    }

    const score = Number.isFinite(minSlack) ? minSlack : 99;
    if (score < bestScore) {
      bestScore = score;
      best = edge;
    }
  }

  return best;
}

function cluesMatch(play: SlitherlinkPlayState, clues: (number | null)[][]): boolean {
  for (let row = 0; row < clues.length; row += 1) {
    for (let col = 0; col < clues[row].length; col += 1) {
      const clue = clues[row][col];
      if (clue == null) continue;
      if (lineCountAroundCell(play, row, col) !== clue) return false;
    }
  }
  return true;
}

function solveRecursive(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
  limit: number,
  found: { count: number },
): void {
  if (found.count >= limit) return;

  const work = clonePlayState(play);
  while (runPropagation(work, clues)) {
    if (!isPartialConsistent(work, clues)) return;
  }

  if (!isPartialConsistent(work, clues)) return;

  const unknown = findBranchEdge(work, clues);
  if (unknown == null) {
    if (isSingleLoopComplete(work) && cluesMatch(work, clues)) {
      found.count += 1;
    }
    return;
  }

  for (const state of [EDGE_LINE, EDGE_BLANK]) {
    const branch = clonePlayState(work);
    setEdgeAt(branch, unknown.orientation, unknown.row, unknown.col, state);
    if (isPartialConsistent(branch, clues)) {
      solveRecursive(branch, clues, limit, found);
      if (found.count >= limit) return;
    }
  }
}

export function countSolutionsUpTo(
  clues: (number | null)[][],
  playPartial: SlitherlinkPlayState,
  maxSolutions: number,
): number {
  const play = clonePlayState(playPartial);
  const found = { count: 0 };
  solveRecursive(play, clues, maxSolutions, found);
  return found.count;
}

export function solve(
  clues: (number | null)[][],
  playPartial: SlitherlinkPlayState = createEmptyPlayState(),
): boolean {
  return countSolutionsUpTo(clues, playPartial, 2) === 1;
}
