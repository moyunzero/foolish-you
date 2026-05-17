import { SUDOKU_GIVEN_COUNT } from '../../../../constants/config';
import { generateSudokuPuzzle } from '../../../../lib/puzzles/sudoku/generator';
import { countGivens } from '../../../../lib/puzzles/sudoku/grid';
import { countSolutionsUpTo } from '../../../../lib/puzzles/sudoku/solver';

describe('generateSudokuPuzzle', () => {
  it('is deterministic for the same seed', () => {
    const first = generateSudokuPuzzle(42_001);
    const second = generateSudokuPuzzle(42_001);
    expect(second.givens).toEqual(first.givens);
    expect(second.puzzleHash).toBe(first.puzzleHash);
  });

  it('produces exactly SUDOKU_GIVEN_COUNT givens', () => {
    const puzzle = generateSudokuPuzzle(99_002);
    expect(countGivens(puzzle.givens)).toBe(SUDOKU_GIVEN_COUNT);
  });

  it('has a unique solution', () => {
    const puzzle = generateSudokuPuzzle(77_003);
    expect(countSolutionsUpTo(puzzle.givens, 2)).toBe(1);
  });

  it('puzzleHash is not stub-v1', () => {
    const puzzle = generateSudokuPuzzle(12_004);
    expect(puzzle.puzzleHash).not.toBe('stub-v1');
    expect(puzzle.puzzleHash.startsWith('sudo-')).toBe(true);
  });
});
