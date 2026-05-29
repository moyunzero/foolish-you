import { act, renderHook } from '@testing-library/react-native';
import React, { type ReactNode } from 'react';

import { useBinaryBoard } from '../../hooks/useBinaryBoard';
import { I18nTestProvider } from '../../lib/i18n/I18nContext';
import { generateBinaryPuzzle } from '../../lib/puzzles/binary/generator';
import { BINARY_EMPTY, createEmptyGrid } from '../../lib/puzzles/binary/grid';

function i18nWrapper({ children }: { children: ReactNode }) {
  return <I18nTestProvider locale="zh">{children}</I18nTestProvider>;
}

function firstEditableCell(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] === BINARY_EMPTY) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

function firstGivenCell(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] !== BINARY_EMPTY) return { row, col };
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
      { wrapper: i18nWrapper },
    );

    act(() => {
      result.current.handlePress(row, col);
    });

    expect(updatePlayState).toHaveBeenCalled();
    const next = updatePlayState.mock.calls.at(-1)?.[0];
    expect(next[row][col]).toBe(1);
  });

  it('selects given cells for highlight without cycling value', () => {
    const puzzle = generateBinaryPuzzle(505);
    const updatePlayState = jest.fn();
    const given = firstGivenCell(puzzle.givens);

    const { result } = renderHook(() =>
      useBinaryBoard({
        givens: puzzle.givens,
        playState: createEmptyGrid(),
        updatePlayState,
      }),
      { wrapper: i18nWrapper },
    );

    act(() => {
      result.current.handlePress(given.row, given.col);
    });

    expect(result.current.selected).toEqual(given);
    expect(updatePlayState).not.toHaveBeenCalled();
  });

  it('exposes status hint for empty board', () => {
    const puzzle = generateBinaryPuzzle(404);
    const { result } = renderHook(() =>
      useBinaryBoard({
        givens: puzzle.givens,
        playState: createEmptyGrid(),
        updatePlayState: jest.fn(),
      }),
      { wrapper: i18nWrapper },
    );

    expect(result.current.statusHint).toMatch(/长按清空/);
    expect(result.current.canComplete).toBe(false);
  });

  it('clears editable cell on long press', () => {
    const puzzle = generateBinaryPuzzle(606);
    const updatePlayState = jest.fn();
    const { row, col } = firstEditableCell(puzzle.givens);
    const playState = createEmptyGrid();
    playState[row][col] = 1;

    const { result } = renderHook(() =>
      useBinaryBoard({
        givens: puzzle.givens,
        playState,
        updatePlayState,
      }),
      { wrapper: i18nWrapper },
    );

    act(() => {
      result.current.handleLongPress(row, col);
    });

    expect(updatePlayState).toHaveBeenCalled();
    const cleared = updatePlayState.mock.calls.at(-1)?.[0] as number[][];
    expect(cleared[row][col]).toBe(BINARY_EMPTY);
  });
});
