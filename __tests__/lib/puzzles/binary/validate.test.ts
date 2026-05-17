import { BINARY_ONE, BINARY_ZERO, createEmptyGrid } from '../../../../lib/puzzles/binary/grid';
import { generateBinaryPuzzle } from '../../../../lib/puzzles/binary/generator';
import {
  getConflictCells,
  getViolationCells,
} from '../../../../lib/puzzles/binary/validate';

describe('binary validate', () => {
  it('detects triple in row', () => {
    const grid = createEmptyGrid();
    grid[0][0] = BINARY_ZERO;
    grid[0][1] = BINARY_ZERO;
    grid[0][2] = BINARY_ZERO;
    expect(getViolationCells(grid).length).toBeGreaterThan(0);
  });

  it('detects row with too many ones', () => {
    const grid = createEmptyGrid();
    for (let c = 0; c < 5; c += 1) {
      grid[0][c] = BINARY_ONE;
    }
    expect(getViolationCells(grid).length).toBeGreaterThan(0);
  });

  it('givens from generator have no rule violations', () => {
    const { givens } = generateBinaryPuzzle(7);
    expect(getViolationCells(givens)).toHaveLength(0);
  });

  it('getConflictCells merges givens and play', () => {
    const givens = createEmptyGrid();
    givens[0][0] = BINARY_ZERO;
    const play = createEmptyGrid();
    play[0][1] = BINARY_ZERO;
    play[0][2] = BINARY_ZERO;
    const conflicts = getConflictCells(play, givens);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
