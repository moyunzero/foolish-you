import { BINARY_SIZE } from './spec';
import {
  BINARY_EMPTY,
  BINARY_ONE,
  BINARY_ZERO,
  cloneGrid,
} from './grid';
import { getViolationCells } from './validate';

function isPlacementValid(grid: number[][], row: number, col: number, value: number): boolean {
  const trial = cloneGrid(grid);
  trial[row][col] = value;
  return getViolationCells(trial).length === 0;
}

function findEmpty(grid: number[][]): { row: number; col: number } | null {
  for (let row = 0; row < BINARY_SIZE; row += 1) {
    for (let col = 0; col < BINARY_SIZE; col += 1) {
      if (grid[row][col] === BINARY_EMPTY) return { row, col };
    }
  }
  return null;
}

function solveBacktrack(grid: number[][], limit: number, found: { count: number }): boolean {
  if (found.count >= limit) return true;

  const empty = findEmpty(grid);
  if (empty == null) {
    found.count += 1;
    return found.count >= limit;
  }

  const { row, col } = empty;
  for (const value of [BINARY_ZERO, BINARY_ONE]) {
    if (!isPlacementValid(grid, row, col, value)) continue;
    grid[row][col] = value;
    if (solveBacktrack(grid, limit, found)) return true;
    grid[row][col] = BINARY_EMPTY;
  }

  return false;
}

export function countSolutionsUpTo(givens: number[][], limit: number): number {
  const grid = cloneGrid(givens);
  const found = { count: 0 };
  solveBacktrack(grid, limit, found);
  return found.count;
}

export function solve(givens: number[][]): boolean {
  const grid = cloneGrid(givens);
  const found = { count: 0 };
  solveBacktrack(grid, 1, found);
  return found.count === 1;
}

/** 生成完整解时用的宽松校验（仅平衡 + 禁三连 + 行列唯一） */
export function isCompleteGridValid(grid: number[][]): boolean {
  return getViolationCells(grid).length === 0;
}

export function fillCompleteGrid(rng: () => number, maxAttempts = 200): number[][] | null {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const grid = Array.from({ length: BINARY_SIZE }, () =>
      Array(BINARY_SIZE).fill(BINARY_EMPTY),
    );
    if (fillRandom(grid, 0, 0, rng) && isCompleteGridValid(grid)) {
      return grid;
    }
  }
  return null;
}

function fillRandom(
  grid: number[][],
  row: number,
  col: number,
  rng: () => number,
): boolean {
  if (row >= BINARY_SIZE) return true;

  const nextRow = col + 1 >= BINARY_SIZE ? row + 1 : row;
  const nextCol = col + 1 >= BINARY_SIZE ? 0 : col + 1;

  const options = [BINARY_ZERO, BINARY_ONE];
  if (rng() > 0.5) options.reverse();

  for (const value of options) {
    if (!isPlacementValid(grid, row, col, value)) continue;
    grid[row][col] = value;
    if (fillRandom(grid, nextRow, nextCol, rng)) return true;
    grid[row][col] = BINARY_EMPTY;
  }

  return false;
}
