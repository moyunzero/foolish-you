import {
  SUDOKU_GIVEN_COUNT,
  SUDOKU_MAX_GEN_ATTEMPTS,
} from '../../../constants/config';
import { sudokuGivensForDate } from '../difficulty/weekdayBand';
import { deriveSubSeed, mulberry32 } from '../rng';
import type { SudokuPuzzle } from '../types';
import {
  cloneGrid,
  countGivens,
  createEmptyGrid,
  indexToCoord,
  shuffleIndices,
} from './grid';
import { computePuzzleHash } from './hash';
import { countSolutionsUpTo, solve } from './solver';

function fillCompleteGrid(rng: () => number): number[][] {
  const grid = createEmptyGrid();
  solveBacktrackWithRng(grid, rng);
  return grid;
}

function solveBacktrackWithRng(grid: number[][], rng: () => number): boolean {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (grid[row][col] !== 0) continue;

      const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let i = digits.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
      }

      for (const value of digits) {
        grid[row][col] = value;
        if (isPlacementValid(grid, row, col, value) && solveBacktrackWithRng(grid, rng)) {
          return true;
        }
        grid[row][col] = 0;
      }
      return false;
    }
  }
  return true;
}

function isPlacementValid(
  grid: number[][],
  row: number,
  col: number,
  value: number,
): boolean {
  for (let c = 0; c < 9; c += 1) {
    if (c !== col && grid[row][c] === value) return false;
  }
  for (let r = 0; r < 9; r += 1) {
    if (r !== row && grid[r][col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if ((r !== row || c !== col) && grid[r][c] === value) return false;
    }
  }
  return true;
}

function carvePuzzle(
  complete: number[][],
  rng: () => number,
  targetGivens: number,
): number[][] | null {
  const givens = cloneGrid(complete);
  const positions = shuffleIndices(81, rng);

  for (const index of positions) {
    if (countGivens(givens) === targetGivens) break;

    const { row, col } = indexToCoord(index);
    const backup = givens[row][col];
    givens[row][col] = 0;

    if (countSolutionsUpTo(givens, 2) !== 1) {
      givens[row][col] = backup;
    }
  }

  if (countGivens(givens) !== targetGivens) return null;
  if (countSolutionsUpTo(givens, 2) !== 1) return null;
  if (!solve(givens)) return null;

  return givens;
}

function generateOnce(seed: number, targetGivens: number): SudokuPuzzle | null {
  const rng = mulberry32(seed);
  const complete = fillCompleteGrid(rng);
  const givens = carvePuzzle(complete, rng, targetGivens);
  if (givens == null) return null;

  return {
    kind: 'sudoku',
    givens,
    puzzleHash: computePuzzleHash(givens),
  };
}

export function generateSudokuPuzzle(seed: number, dateKey?: string): SudokuPuzzle {
  const targetGivens =
    dateKey != null ? sudokuGivensForDate(dateKey) : SUDOKU_GIVEN_COUNT;
  for (let attempt = 0; attempt < SUDOKU_MAX_GEN_ATTEMPTS; attempt += 1) {
    const attemptSeed = deriveSubSeed(seed, `gen-${attempt}`);
    const puzzle = generateOnce(attemptSeed, targetGivens);
    if (puzzle != null) return puzzle;
  }

  const fallback = generateOnce(deriveSubSeed(seed, 'gen-fallback'), targetGivens);
  if (fallback != null) return fallback;

  throw new Error('Failed to generate sudoku puzzle');
}
