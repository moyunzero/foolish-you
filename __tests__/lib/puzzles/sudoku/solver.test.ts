import { createEmptyGrid } from '../../../../lib/puzzles/sudoku/grid';
import { countSolutionsUpTo, solve } from '../../../../lib/puzzles/sudoku/solver';

describe('sudoku solver', () => {
  it('reports solvable for an empty grid', () => {
    const grid = createEmptyGrid();
    expect(solve(grid)).toBe(true);
  });

  it('counts solutions for a minimal clue', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 5;
    expect(countSolutionsUpTo(grid, 2)).toBeGreaterThanOrEqual(1);
  });
});
