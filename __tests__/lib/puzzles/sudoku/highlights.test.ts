import { getCellHighlightKind } from '../../../../lib/puzzles/sudoku/highlights';
import { createEmptyGrid } from '../../../../lib/puzzles/sudoku/grid';

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

describe('getCellHighlightKind', () => {
  const play = createEmptyGrid();
  play[0][2] = 4;

  it('highlights selected cell', () => {
    expect(
      getCellHighlightKind(0, 2, { row: 0, col: 2 }, givens, play),
    ).toBe('selected');
  });

  it('highlights row and column peers', () => {
    expect(
      getCellHighlightKind(0, 0, { row: 0, col: 2 }, givens, play),
    ).toBe('peer');
    expect(
      getCellHighlightKind(4, 2, { row: 0, col: 2 }, givens, play),
    ).toBe('peer');
  });

  it('highlights same digit elsewhere', () => {
    play[1][1] = 4;
    expect(
      getCellHighlightKind(1, 1, { row: 0, col: 2 }, givens, play),
    ).toBe('sameDigit');
  });

  it('highlights matching givens when a clue cell is selected', () => {
    expect(
      getCellHighlightKind(0, 0, { row: 0, col: 0 }, givens, play),
    ).toBe('selected');
    expect(
      getCellHighlightKind(1, 5, { row: 0, col: 0 }, givens, play),
    ).toBe('sameDigit');
  });
});
