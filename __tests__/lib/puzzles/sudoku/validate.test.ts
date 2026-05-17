import {
  getConflictCells,
  isCompleteAndValid,
} from '../../../../lib/puzzles/sudoku/validate';
import { createEmptyGrid } from '../../../../lib/puzzles/sudoku/grid';

const sampleGivens = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

describe('validate', () => {
  it('detects row conflicts', () => {
    const play = createEmptyGrid();
    play[0][2] = 5;
    play[0][3] = 5;
    const conflicts = getConflictCells(play, sampleGivens);
    expect(conflicts).toEqual(
      expect.arrayContaining([
        { row: 0, col: 0 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]),
    );
  });

  it('isCompleteAndValid is false when incomplete', () => {
    const play = createEmptyGrid();
    expect(isCompleteAndValid(play, sampleGivens)).toBe(false);
  });

  it('isCompleteAndValid is false when conflicts exist', () => {
    const play = createEmptyGrid();
    for (let col = 0; col < 9; col += 1) {
      if (sampleGivens[0][col] === 0) play[0][col] = 1;
    }
    play[0][2] = 5;
    expect(isCompleteAndValid(play, sampleGivens)).toBe(false);
  });
});
