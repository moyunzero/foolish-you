import {
  getDigitsUsedInUnit,
  getDisplayValue,
} from '../../../../lib/puzzles/sudoku/display';

const givens = [
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

const play = Array.from({ length: 9 }, () => Array(9).fill(0));

describe('getDigitsUsedInUnit', () => {
  it('collects digits in row, column and box of selected cell', () => {
    const used = getDigitsUsedInUnit(givens, play, { row: 0, col: 2 });
    expect(used.has(5)).toBe(true);
    expect(used.has(3)).toBe(true);
    expect(used.has(9)).toBe(true);
    expect(used.has(8)).toBe(true);
    expect(used.has(7)).toBe(true);
  });

  it('includes user-filled values', () => {
    play[0][2] = 4;
    expect(getDisplayValue(givens, play, 0, 2)).toBe(4);
    const used = getDigitsUsedInUnit(givens, play, { row: 0, col: 2 });
    expect(used.has(4)).toBe(true);
  });
});
