import { createEmptyPlayState } from '../../../../lib/puzzles/slitherlink/edges';
import { generateSlitherlinkPuzzle, isPerimeterLoop } from '../../../../lib/puzzles/slitherlink/generator';
import { countSolutionsUpTo, solve } from '../../../../lib/puzzles/slitherlink/solver';
import { SLITHERLINK_SIZE } from '../../../../lib/puzzles/slitherlink/spec';

function nullClues(): (number | null)[][] {
  return Array.from({ length: SLITHERLINK_SIZE }, () =>
    Array<number | null>(SLITHERLINK_SIZE).fill(null),
  );
}

describe('slitherlink solver', () => {
  it('finds a unique solution for a carved daily puzzle', () => {
    const puzzle = generateSlitherlinkPuzzle(42);
    expect(isPerimeterLoop(puzzle.solution)).toBe(false);

    expect(countSolutionsUpTo(puzzle.clues, createEmptyPlayState(), 2)).toBe(1);
    expect(solve(puzzle.clues)).toBe(true);
  });

  it('detects multiple solutions when clues are under-constrained', () => {
    const clues = nullClues();
    clues[0][0] = 0;
    clues[0][1] = 0;
    clues[1][0] = 0;
    clues[1][1] = 0;
    expect(countSolutionsUpTo(clues, createEmptyPlayState(), 2)).toBeGreaterThanOrEqual(2);
  });

  it('returns zero solutions for an impossible clue', () => {
    const clues = nullClues();
    clues[0][0] = 4;
    expect(countSolutionsUpTo(clues, createEmptyPlayState(), 2)).toBe(0);
  });
});
