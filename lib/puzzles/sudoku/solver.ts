import { SUDOKU_BOX, SUDOKU_SIZE } from './grid';

function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  value: number,
): boolean {
  for (let c = 0; c < SUDOKU_SIZE; c += 1) {
    if (c !== col && grid[row][c] === value) return false;
  }
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    if (r !== row && grid[r][col] === value) return false;
  }
  const boxRow = Math.floor(row / SUDOKU_BOX) * SUDOKU_BOX;
  const boxCol = Math.floor(col / SUDOKU_BOX) * SUDOKU_BOX;
  for (let r = boxRow; r < boxRow + SUDOKU_BOX; r += 1) {
    for (let c = boxCol; c < boxCol + SUDOKU_BOX; c += 1) {
      if ((r !== row || c !== col) && grid[r][c] === value) return false;
    }
  }
  return true;
}

function findEmptyCell(grid: number[][]): { row: number; col: number } | null {
  for (let row = 0; row < SUDOKU_SIZE; row += 1) {
    for (let col = 0; col < SUDOKU_SIZE; col += 1) {
      if (grid[row][col] === 0) return { row, col };
    }
  }
  return null;
}

function solveBacktrack(
  grid: number[][],
  rng?: () => number,
): boolean {
  const empty = findEmptyCell(grid);
  if (empty == null) return true;

  const { row, col } = empty;
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (rng != null) {
    for (let i = digits.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
  }

  for (const value of digits) {
    if (!isValidPlacement(grid, row, col, value)) continue;
    grid[row][col] = value;
    if (solveBacktrack(grid, rng)) return true;
    grid[row][col] = 0;
  }
  return false;
}

/** 求某一格的可行解（用于计数） */
function countSolutions(grid: number[][], limit: number): number {
  const empty = findEmptyCell(grid);
  if (empty == null) return 1;

  let total = 0;
  const { row, col } = empty;
  for (let value = 1; value <= 9; value += 1) {
    if (!isValidPlacement(grid, row, col, value)) continue;
    grid[row][col] = value;
    total += countSolutions(grid, limit);
    grid[row][col] = 0;
    if (total >= limit) return total;
  }
  return total;
}

export function solve(grid: number[][]): boolean {
  const working = grid.map((row) => [...row]);
  return solveBacktrack(working);
}

export function countSolutionsUpTo(
  grid: number[][],
  limit: number,
): number {
  const working = grid.map((row) => [...row]);
  return countSolutions(working, limit);
}
