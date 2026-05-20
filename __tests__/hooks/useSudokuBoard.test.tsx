import { act, renderHook } from '@testing-library/react-native';

import { useSudokuBoard } from '../../hooks/useSudokuBoard';
import { generateSudokuPuzzle } from '../../lib/puzzles/sudoku/generator';
import { createEmptyGrid } from '../../lib/puzzles/sudoku/grid';

function firstEmptyCell(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] === 0) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

describe('useSudokuBoard', () => {
  it('disables numpad until an editable cell is selected', () => {
    const puzzle = generateSudokuPuzzle(101);
    const updatePlayState = jest.fn();

    const { result } = renderHook(() =>
      useSudokuBoard({
        givens: puzzle.givens,
        playState: createEmptyGrid(),
        updatePlayState,
      }),
    );

    expect(result.current.numpadDisabled).toBe(true);

    const { row, col } = firstEmptyCell(puzzle.givens);
    act(() => {
      result.current.handleSelect(row, col);
    });

    expect(result.current.numpadDisabled).toBe(false);
  });

  it('writes digit into play state via updatePlayState', () => {
    const puzzle = generateSudokuPuzzle(202);
    const updatePlayState = jest.fn();
    const playState = createEmptyGrid();
    const { row, col } = firstEmptyCell(puzzle.givens);

    const { result } = renderHook(() =>
      useSudokuBoard({
        givens: puzzle.givens,
        playState,
        updatePlayState,
      }),
    );

    act(() => {
      result.current.handleSelect(row, col);
    });
    act(() => {
      result.current.handleDigit(5);
    });

    expect(updatePlayState).toHaveBeenCalled();
    const next = updatePlayState.mock.calls.at(-1)?.[0];
    expect(next[row][col]).toBe(5);
  });
});
