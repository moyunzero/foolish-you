import { fireEvent, screen } from '@testing-library/react-native';

import SudokuGrid from '../../../components/grid/SudokuGrid';
import { renderWithI18n } from '../../helpers/renderWithI18n';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';
import { createEmptyGrid } from '../../../lib/puzzles/sudoku/grid';

function firstEmptyCoord(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] === 0) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

describe('SudokuGrid', () => {
  it('calls onSelectCell when an empty cell is pressed', () => {
    const puzzle = generateSudokuPuzzle(303);
    const onSelectCell = jest.fn();
    const { row, col } = firstEmptyCoord(puzzle.givens);

    renderWithI18n(
      <SudokuGrid
        givens={puzzle.givens}
        playState={createEmptyGrid()}
        selected={null}
        conflictCells={[]}
        onSelectCell={onSelectCell}
        onLongPressCell={jest.fn()}
      />,
    );

    fireEvent.press(
      screen.getByLabelText(`第 ${row + 1} 行第 ${col + 1} 列，空`),
    );
    expect(onSelectCell).toHaveBeenCalledWith(row, col);
  });

  it('exposes given cell accessibility label', () => {
    const puzzle = generateSudokuPuzzle(404);
    let givenRow = 0;
    let givenCol = 0;
    outer: for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (puzzle.givens[r][c] !== 0) {
          givenRow = r;
          givenCol = c;
          break outer;
        }
      }
    }

    renderWithI18n(
      <SudokuGrid
        givens={puzzle.givens}
        playState={createEmptyGrid()}
        selected={null}
        conflictCells={[]}
        onSelectCell={jest.fn()}
        onLongPressCell={jest.fn()}
      />,
    );

    const value = puzzle.givens[givenRow][givenCol];
    expect(
      screen.getByLabelText(
        `第 ${givenRow + 1} 行第 ${givenCol + 1} 列，已知数 ${value}`,
      ),
    ).toBeTruthy();
  });

  it('calls onLongPressCell when a cell is long pressed', () => {
    const puzzle = generateSudokuPuzzle(505);
    const onLongPressCell = jest.fn();
    const { row, col } = firstEmptyCoord(puzzle.givens);

    renderWithI18n(
      <SudokuGrid
        givens={puzzle.givens}
        playState={createEmptyGrid()}
        selected={null}
        conflictCells={[]}
        onSelectCell={jest.fn()}
        onLongPressCell={onLongPressCell}
      />,
    );

    fireEvent(
      screen.getByLabelText(`第 ${row + 1} 行第 ${col + 1} 列，空`),
      'longPress',
    );
    expect(onLongPressCell).toHaveBeenCalledWith(row, col);
  });
});
