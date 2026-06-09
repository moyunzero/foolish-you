import {
  BINARY_EMPTY,
  BINARY_ONE,
  BINARY_ZERO,
  cloneGrid as cloneBinaryGrid,
  createEmptyGrid as createEmptyBinaryGrid,
} from '../puzzles/binary/grid';
import { getViolationCells } from '../puzzles/binary/validate';
import { BINARY_SIZE } from '../puzzles/binary/spec';
import {
  clonePlayState as cloneSlitherlinkPlay,
  createEmptyPlayState as createEmptySlitherlinkPlay,
} from '../puzzles/slitherlink/edges';
import {
  cloneGrid as cloneSudokuGrid,
  createEmptyGrid as createEmptySudokuGrid,
} from '../puzzles/sudoku/grid';
import { solveInPlace as solveSudokuInPlace } from '../puzzles/sudoku/solver';
import type {
  BinaryGivens,
  BinaryPlayState,
  GameType,
  NonogramPlayState,
  PlayState,
  PuzzlePayload,
  SlitherlinkPlayState,
  SudokuGivens,
  SudokuPlayState,
} from '../puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from '../puzzles/types';
import { NONOGRAM_EMPTY, NONOGRAM_FILL } from '../puzzles/nonogram/spec';

function isBinaryPlacementValid(
  grid: number[][],
  row: number,
  col: number,
  value: number,
): boolean {
  const trial = cloneBinaryGrid(grid);
  trial[row][col] = value;
  return getViolationCells(trial).length === 0;
}

function findBinaryEmpty(grid: number[][]): { row: number; col: number } | null {
  for (let row = 0; row < BINARY_SIZE; row += 1) {
    for (let col = 0; col < BINARY_SIZE; col += 1) {
      if (grid[row][col] === BINARY_EMPTY) return { row, col };
    }
  }
  return null;
}

function solveBinaryInPlace(givens: BinaryGivens): BinaryPlayState | null {
  const grid = cloneBinaryGrid(givens);

  function backtrack(): boolean {
    const empty = findBinaryEmpty(grid);
    if (empty == null) return true;

    const { row, col } = empty;
    for (const value of [BINARY_ZERO, BINARY_ONE]) {
      if (!isBinaryPlacementValid(grid, row, col, value)) continue;
      grid[row][col] = value;
      if (backtrack()) return true;
      grid[row][col] = BINARY_EMPTY;
    }
    return false;
  }

  return backtrack() ? grid : null;
}

function sudokuCompletedPlay(givens: SudokuGivens): SudokuPlayState {
  const grid = cloneSudokuGrid(givens);
  solveSudokuInPlace(grid);
  return grid;
}

function nonogramSolutionPlay(solution: boolean[][]): NonogramPlayState {
  return solution.map((row) =>
    row.map((filled) => (filled ? NONOGRAM_FILL : NONOGRAM_EMPTY)),
  );
}

/** Best-effort playState for gallery emoji tiles when snapshot is unavailable. */
export function buildSyntheticPlayState(
  gameType: GameType,
  puzzle: PuzzlePayload,
  outcome: 'completed' | 'abandoned',
): PlayState {
  if (outcome === 'abandoned') {
    if (gameType === 'slitherlink') return createEmptySlitherlinkPlay();
    if (gameType === 'binary') return createEmptyBinaryGrid();
    if (gameType === 'nonogram') {
      const rows = isNonogramPuzzle(puzzle) ? puzzle.rows : 8;
      return Array.from({ length: rows }, () =>
        Array(rows).fill(NONOGRAM_EMPTY),
      );
    }
    return createEmptySudokuGrid();
  }

  if (gameType === 'sudoku' && isSudokuPuzzle(puzzle)) {
    return sudokuCompletedPlay(puzzle.givens);
  }
  if (gameType === 'binary' && isBinaryPuzzle(puzzle)) {
    return solveBinaryInPlace(puzzle.givens) ?? createEmptyBinaryGrid();
  }
  if (gameType === 'slitherlink' && isSlitherlinkPuzzle(puzzle)) {
    return cloneSlitherlinkPlay(puzzle.solution);
  }
  if (gameType === 'nonogram' && isNonogramPuzzle(puzzle)) {
    return nonogramSolutionPlay(puzzle.solution);
  }

  return createEmptySudokuGrid();
}
