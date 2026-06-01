import {
  SLITHERLINK_MAX_GEN_ATTEMPTS,
  SLITHERLINK_MIN_CLUES,
} from '../../../constants/config';
import { deriveSubSeed, mulberry32 } from '../rng';
import type { SlitherlinkPuzzle, SlitherlinkSolutionEdges } from './spec';
import { EDGE_BLANK, EDGE_LINE, SLITHERLINK_SIZE } from './spec';
import {
  cloneSolutionEdges,
  countClueCells,
  createBlankSolution,
  createEmptyPlayState,
  cluesFromSolutionEdges,
  shuffleCellCoords,
} from './edges';
import { getSlitherlinkBuiltinPuzzle } from './builtinPuzzle';
import { computePuzzleHash } from './hash';
import { countSolutionsUpTo, solve } from './solver';
import { isSingleLoopComplete } from './validate';

export type SlitherlinkDifficulty = 'easy' | 'medium' | 'hard';

const CELL_COUNT = SLITHERLINK_SIZE * SLITHERLINK_SIZE;

const DIFFICULTY_MIN_CLUES: Record<SlitherlinkDifficulty, number> = {
  easy: Math.max(SLITHERLINK_MIN_CLUES + 6, 24),
  medium: SLITHERLINK_MIN_CLUES + 2,
  hard: Math.max(SLITHERLINK_MIN_CLUES - 4, 14),
};

/** 「环内」格子数量：大区更易、小区更绕，形状由随机 polyomino 决定 */
const DIFFICULTY_INSIDE_RANGE: Record<
  SlitherlinkDifficulty,
  { min: number; max: number }
> = {
  easy: { min: 30, max: 44 },
  medium: { min: 20, max: 36 },
  hard: { min: 12, max: 28 },
};

type CellCoord = { row: number; col: number };

type GrowStrategy = 'organic' | 'worm' | 'dual' | 'interior';

function createInsideMask(): boolean[][] {
  return Array.from({ length: SLITHERLINK_SIZE }, () =>
    Array<boolean>(SLITHERLINK_SIZE).fill(false),
  );
}

function countInsideCells(inside: boolean[][]): number {
  let count = 0;
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (inside[row][col]) count += 1;
    }
  }
  return count;
}

function neighbors(row: number, col: number): CellCoord[] {
  const deltas = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];
  return deltas
    .map(({ row: dr, col: dc }) => ({ row: row + dr, col: col + dc }))
    .filter(
      ({ row: nr, col: nc }) =>
        nr >= 0 && nr < SLITHERLINK_SIZE && nc >= 0 && nc < SLITHERLINK_SIZE,
    );
}

function shuffleCoords(coords: CellCoord[], rng: () => number): CellCoord[] {
  const copy = [...coords];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickStartCell(rng: () => number): CellCoord {
  return {
    row: Math.floor(rng() * SLITHERLINK_SIZE),
    col: Math.floor(rng() * SLITHERLINK_SIZE),
  };
}

function growOrganicPolyomino(
  rng: () => number,
  targetSize: number,
  seeds: CellCoord[],
): boolean[][] {
  const inside = createInsideMask();
  const frontier: CellCoord[] = [];

  for (const seed of seeds) {
    if (inside[seed.row][seed.col]) continue;
    inside[seed.row][seed.col] = true;
    frontier.push(seed);
  }

  let cells = countInsideCells(inside);
  if (cells === 0) return inside;

  while (cells < targetSize && frontier.length > 0) {
    const idx = Math.floor(rng() * frontier.length);
    const cell = frontier[idx];
    const options = shuffleCoords(neighbors(cell.row, cell.col), rng).filter(
      ({ row, col }) => !inside[row][col],
    );

    if (options.length === 0) {
      frontier.splice(idx, 1);
      continue;
    }

    const next = options[0];
    inside[next.row][next.col] = true;
    cells += 1;
    frontier.push(next);
  }

  return inside;
}

const INTERIOR_MIN = 1;
const INTERIOR_MAX = SLITHERLINK_SIZE - 2;

function isInteriorCell(row: number, col: number): boolean {
  return (
    row >= INTERIOR_MIN &&
    row <= INTERIOR_MAX &&
    col >= INTERIOR_MIN &&
    col <= INTERIOR_MAX
  );
}

/** 只在棋盘内核生长 → 闭合环不贴外框（商业题常见的「中间小圈」） */
function growInteriorPolyomino(
  rng: () => number,
  targetSize: number,
): boolean[][] {
  const inside = createInsideMask();
  const coreCells: CellCoord[] = [];
  for (let row = INTERIOR_MIN; row <= INTERIOR_MAX; row += 1) {
    for (let col = INTERIOR_MIN; col <= INTERIOR_MAX; col += 1) {
      coreCells.push({ row, col });
    }
  }
  const start = coreCells[Math.floor(rng() * coreCells.length)];
  inside[start.row][start.col] = true;
  const frontier: CellCoord[] = [start];
  let cells = 1;

  while (cells < targetSize && frontier.length > 0) {
    const idx = Math.floor(rng() * frontier.length);
    const cell = frontier[idx];
    const options = shuffleCoords(neighbors(cell.row, cell.col), rng).filter(
      ({ row, col }) => !inside[row][col] && isInteriorCell(row, col),
    );

    if (options.length === 0) {
      frontier.splice(idx, 1);
      continue;
    }

    const next = options[0];
    inside[next.row][next.col] = true;
    cells += 1;
    frontier.push(next);
  }

  return inside;
}

function growWormPolyomino(
  rng: () => number,
  targetSize: number,
): boolean[][] {
  const inside = createInsideMask();
  let { row, col } = pickStartCell(rng);
  inside[row][col] = true;
  let cells = 1;
  let lastDelta: CellCoord = { row: 0, col: 0 };

  while (cells < targetSize) {
    const options = shuffleCoords(neighbors(row, col), rng).filter(
      ({ row: nr, col: nc }) => !inside[nr][nc],
    );
    if (options.length === 0) break;

    let next = options[0];
    if (lastDelta.row !== 0 || lastDelta.col !== 0) {
      const straight = options.find(
        ({ row: nr, col: nc }) =>
          nr - row === lastDelta.row && nc - col === lastDelta.col,
      );
      if (straight != null && rng() < 0.62) {
        next = straight;
      }
    }

    lastDelta = { row: next.row - row, col: next.col - col };
    row = next.row;
    col = next.col;
    inside[row][col] = true;
    cells += 1;
  }

  return inside;
}

function growInsideRegion(
  rng: () => number,
  targetSize: number,
  strategy: GrowStrategy,
): boolean[][] {
  if (strategy === 'interior') {
    const capped = Math.min(
      targetSize,
      (INTERIOR_MAX - INTERIOR_MIN + 1) ** 2,
    );
    return growInteriorPolyomino(rng, capped);
  }

  if (strategy === 'worm') {
    return growWormPolyomino(rng, targetSize);
  }

  if (strategy === 'dual') {
    const first = pickStartCell(rng);
    let second = pickStartCell(rng);
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const dr = Math.abs(first.row - second.row);
      const dc = Math.abs(first.col - second.col);
      if (dr + dc >= 4) break;
      second = pickStartCell(rng);
    }
    return growOrganicPolyomino(rng, targetSize, [first, second]);
  }

  return growOrganicPolyomino(rng, targetSize, [pickStartCell(rng)]);
}

/** 环内区域与环外区域的分界线 → 唯一闭合回路（不依赖外框模板） */
export function solutionFromInsideMask(
  inside: boolean[][],
): SlitherlinkSolutionEdges {
  const solution = createBlankSolution();
  const n = SLITHERLINK_SIZE;

  for (let col = 0; col < n; col += 1) {
    const below = inside[0][col];
    if (below) solution.h[0][col] = EDGE_LINE;
  }

  for (let row = 1; row <= n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      const above = inside[row - 1][col];
      const below = row < n ? inside[row][col] : false;
      if (above !== below) solution.h[row][col] = EDGE_LINE;
    }
  }

  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col <= n; col += 1) {
      const left = col > 0 ? inside[row][col - 1] : false;
      const right = col < n ? inside[row][col] : false;
      if (left !== right) solution.v[row][col] = EDGE_LINE;
    }
  }

  return solution;
}

const GROW_STRATEGIES: GrowStrategy[] = ['organic', 'worm', 'dual', 'interior'];

export function pickSlitherlinkDifficulty(rng: () => number): SlitherlinkDifficulty {
  const roll = rng();
  if (roll < 1 / 3) return 'easy';
  if (roll < 2 / 3) return 'medium';
  return 'hard';
}

/**
 * 从随机 polyomino（有机 / 虫形 / 双种子）生成回路，接近商业 Slitherlink 的不规则形状。
 */
export function generateLoop(
  seed: number,
  difficulty: SlitherlinkDifficulty,
): SlitherlinkSolutionEdges | null {
  const { min, max } = DIFFICULTY_INSIDE_RANGE[difficulty];

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const attemptRng = mulberry32(
      deriveSubSeed(seed, `sl-loop-${difficulty}-${attempt}`),
    );
    const target = min + Math.floor(attemptRng() * (max - min + 1));
    let strategy =
      GROW_STRATEGIES[Math.floor(attemptRng() * GROW_STRATEGIES.length)];
    const interiorMax = (INTERIOR_MAX - INTERIOR_MIN + 1) ** 2;
    if (strategy === 'interior' && target > interiorMax) {
      strategy = 'organic';
    }

    const inside = growInsideRegion(attemptRng, target, strategy);
    const insideCount = countInsideCells(inside);
    if (insideCount < min || insideCount >= CELL_COUNT) continue;

    const solution = solutionFromInsideMask(inside);
    if (!isSingleLoopComplete(solution)) continue;
    if (isPerimeterLoop(solution)) continue;

    return solution;
  }

  return null;
}

export function carveClues(
  solution: SlitherlinkSolutionEdges,
  rng: () => number,
  minClues: number,
): (number | null)[][] | null {
  const clues = cluesFromSolutionEdges(solution);
  const coords = shuffleCellCoords(rng);

  for (const { row, col } of coords) {
    if (countClueCells(clues) <= minClues) break;

    const backup = clues[row][col];
    clues[row][col] = null;

    if (countSolutionsUpTo(clues, createEmptyPlayState(), 2) !== 1) {
      clues[row][col] = backup;
    }
  }

  if (countClueCells(clues) < minClues) return null;
  if (countSolutionsUpTo(clues, createEmptyPlayState(), 2) !== 1) return null;
  if (!solve(clues)) return null;

  return clues;
}

function generateOnce(seed: number): SlitherlinkPuzzle | null {
  const rng = mulberry32(seed);
  const difficulty = pickSlitherlinkDifficulty(rng);
  const solution = generateLoop(seed, difficulty);
  if (solution == null) return null;
  const clues = carveClues(
    solution,
    rng,
    DIFFICULTY_MIN_CLUES[difficulty],
  );
  if (clues == null) return null;

  return {
    kind: 'slitherlink',
    size: SLITHERLINK_SIZE,
    clues,
    puzzleHash: computePuzzleHash(clues),
    solution: cloneSolutionEdges(solution),
  };
}

export function generateSlitherlinkPuzzle(seed: number): SlitherlinkPuzzle {
  for (let attempt = 0; attempt < SLITHERLINK_MAX_GEN_ATTEMPTS; attempt += 1) {
    const attemptSeed = deriveSubSeed(seed, `sl-gen-${attempt}`);
    const puzzle = generateOnce(attemptSeed);
    if (puzzle != null) return puzzle;
  }

  return getSlitherlinkBuiltinPuzzle();
}

export function isPerimeterLoop(solution: SlitherlinkSolutionEdges): boolean {
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      const onTop = row === 0;
      const onBottom = row === SLITHERLINK_SIZE;
      const expected = onTop || onBottom;
      if ((solution.h[row][col] === EDGE_LINE) !== expected) return false;
    }
  }

  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      const onLeft = col === 0;
      const onRight = col === SLITHERLINK_SIZE;
      const expected = onLeft || onRight;
      if ((solution.v[row][col] === EDGE_LINE) !== expected) return false;
    }
  }

  return true;
}

/** True when the loop uses no edge on the puzzle's outer border. */
export function isFullyInteriorLoop(
  solution: SlitherlinkSolutionEdges,
): boolean {
  for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
    if (solution.h[0][col] === EDGE_LINE) return false;
    if (solution.h[SLITHERLINK_SIZE][col] === EDGE_LINE) return false;
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    if (solution.v[row][0] === EDGE_LINE) return false;
    if (solution.v[row][SLITHERLINK_SIZE] === EDGE_LINE) return false;
  }
  return true;
}
