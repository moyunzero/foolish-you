import { countSolutionsUpTo as countBinarySolutions } from './binary/solver';
import { createEmptyPlayState } from './slitherlink/edges';
import { countSolutionsUpTo as countSlitherlinkSolutions } from './slitherlink/solver';
import { countSolutionsUpTo as countSudokuSolutions } from './sudoku/solver';
import type {
  BinaryPuzzle,
  GameType,
  NonogramPuzzle,
  PuzzlePayload,
  SlitherlinkPuzzle,
  SudokuPuzzle,
} from './types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from './types';

function cloneSudokuGivens(givens: number[][]): number[][] {
  return givens.map((row) => [...row]);
}

export function isSudokuPuzzleSolvable(puzzle: SudokuPuzzle): boolean {
  const grid = cloneSudokuGivens(puzzle.givens);
  return countSudokuSolutions(grid, 2) === 1;
}

export function isBinaryPuzzleSolvable(puzzle: BinaryPuzzle): boolean {
  return countBinarySolutions(puzzle.givens, 2) === 1;
}

/** Validates embedded solution grid shape (not a full solver check). */
export function isNonogramPuzzleStructurallyValid(puzzle: NonogramPuzzle): boolean {
  if (puzzle.solution.length !== puzzle.rows) return false;
  return puzzle.solution.every(
    (row) => Array.isArray(row) && row.length === puzzle.cols,
  );
}

export function isSlitherlinkPuzzleSolvable(puzzle: SlitherlinkPuzzle): boolean {
  return countSlitherlinkSolutions(puzzle.clues, createEmptyPlayState(), 2) === 1;
}

export function isPuzzleSolvable(
  gameType: GameType,
  puzzle: PuzzlePayload,
): boolean {
  if (gameType === 'sudoku' && isSudokuPuzzle(puzzle)) {
    return isSudokuPuzzleSolvable(puzzle);
  }
  if (gameType === 'binary' && isBinaryPuzzle(puzzle)) {
    return isBinaryPuzzleSolvable(puzzle);
  }
  if (gameType === 'nonogram' && isNonogramPuzzle(puzzle)) {
    return isNonogramPuzzleStructurallyValid(puzzle);
  }
  if (gameType === 'slitherlink' && isSlitherlinkPuzzle(puzzle)) {
    return isSlitherlinkPuzzleSolvable(puzzle);
  }
  return false;
}
