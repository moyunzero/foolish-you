import { generateBinaryPuzzle } from '../../../lib/puzzles/binary/generator';
import { generateNonogramPuzzle } from '../../../lib/puzzles/nonogram/generator';
import {
  isBinaryPuzzleSolvable,
  isNonogramPuzzleStructurallyValid,
  isPuzzleSolvable,
  isSlitherlinkPuzzleSolvable,
  isSudokuPuzzleSolvable,
} from '../../../lib/puzzles/isSolvable';
import { generateSlitherlinkPuzzle } from '../../../lib/puzzles/slitherlink/generator';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';

describe('isSolvable', () => {
  it('accepts generated sudoku', () => {
    const puzzle = generateSudokuPuzzle(101);
    expect(isSudokuPuzzleSolvable(puzzle)).toBe(true);
    expect(isPuzzleSolvable('sudoku', puzzle)).toBe(true);
  });

  it('accepts generated binary', () => {
    const puzzle = generateBinaryPuzzle(202);
    expect(isBinaryPuzzleSolvable(puzzle)).toBe(true);
    expect(isPuzzleSolvable('binary', puzzle)).toBe(true);
  });

  it('accepts generated nonogram with valid solution grid', () => {
    const puzzle = generateNonogramPuzzle(303);
    expect(isNonogramPuzzleStructurallyValid(puzzle)).toBe(true);
    expect(isPuzzleSolvable('nonogram', puzzle)).toBe(true);
  });

  it('accepts generated slitherlink with unique solution', () => {
    const puzzle = generateSlitherlinkPuzzle(606);
    expect(isSlitherlinkPuzzleSolvable(puzzle)).toBe(true);
    expect(isPuzzleSolvable('slitherlink', puzzle)).toBe(true);
  });

  it('rejects nonogram with mismatched solution dimensions', () => {
    const puzzle = generateNonogramPuzzle(404);
    const broken = {
      ...puzzle,
      solution: puzzle.solution.slice(0, puzzle.rows - 1),
    };
    expect(isNonogramPuzzleStructurallyValid(broken)).toBe(false);
    expect(isPuzzleSolvable('nonogram', broken)).toBe(false);
  });

  it('returns false when gameType does not match puzzle payload', () => {
    const puzzle = generateSudokuPuzzle(505);
    expect(isPuzzleSolvable('binary', puzzle)).toBe(false);
  });
});
