import { act, renderHook } from '@testing-library/react-native';

import { useBinaryBoard } from '../../hooks/useBinaryBoard';
import { generateBinaryPuzzle } from '../../lib/puzzles/binary/generator';
import { BINARY_EMPTY, createEmptyGrid } from '../../lib/puzzles/binary/grid';

function firstEditableCell(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] === BINARY_EMPTY) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

describe('useBinaryBoard', () => {
  it('cycles cell value on press and calls updatePlayState', () => {
    const puzzle = generateBinaryPuzzle(303);
    const updatePlayState = jest.fn();
    const playState = createEmptyGrid();
    const { row, col } = firstEditableCell(puzzle.givens);

    const { result } = renderHook(() =>
      useBinaryBoard({
        givens: puzzle.givens,
        playState,
        updatePlayState,
      }),
    );

    act(() => {
      result.current.handlePress(row, col);
    });

    expect(updatePlayState).toHaveBeenCalled();
    const next = updatePlayState.mock.calls.at(-1)?.[0];
    expect(next[row][col]).toBe(1);
  });

  it('exposes status hint for empty board', () => {
    const puzzle = generateBinaryPuzzle(404);
    const { result } = renderHook(() =>
      useBinaryBoard({
        givens: puzzle.givens,
        playState: createEmptyGrid(),
        updatePlayState: jest.fn(),
      }),
    );

    expect(result.current.statusHint).toMatch(/点格子/);
    expect(result.current.canComplete).toBe(false);
  });
});
