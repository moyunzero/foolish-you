import { createEmptyGrid } from '../../../../lib/puzzles/binary/grid';
import { countSolutionsUpTo } from '../../../../lib/puzzles/binary/solver';

describe('binary solver', () => {
  it('counts at least one solution for empty grid', () => {
    const grid = createEmptyGrid();
    expect(countSolutionsUpTo(grid, 1)).toBe(1);
  });
});
