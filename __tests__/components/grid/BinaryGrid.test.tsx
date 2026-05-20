import { fireEvent, render, screen } from '@testing-library/react-native';

import BinaryGrid from '../../../components/grid/BinaryGrid';
import { generateBinaryPuzzle } from '../../../lib/puzzles/binary/generator';
import {
  BINARY_EMPTY,
  createEmptyGrid,
} from '../../../lib/puzzles/binary/grid';

function firstEmptyCoord(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] === BINARY_EMPTY) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

describe('BinaryGrid', () => {
  it('calls onPressCell when a cell is pressed', () => {
    const puzzle = generateBinaryPuzzle(505);
    const onPressCell = jest.fn();
    const { row, col } = firstEmptyCoord(puzzle.givens);

    render(
      <BinaryGrid
        givens={puzzle.givens}
        playState={createEmptyGrid()}
        selected={null}
        conflictCells={[]}
        onPressCell={onPressCell}
      />,
    );

    fireEvent.press(
      screen.getByLabelText(`第 ${row + 1} 行第 ${col + 1} 列，空`),
    );
    expect(onPressCell).toHaveBeenCalledWith(row, col);
  });
});
