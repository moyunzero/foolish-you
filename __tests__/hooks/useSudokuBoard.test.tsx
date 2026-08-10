import { act, renderHook } from '@testing-library/react-native';
import React, { type ReactNode } from 'react';

import { useSudokuBoard } from '../../hooks/useSudokuBoard';
import { I18nTestProvider } from '../../lib/i18n/I18nContext';
import { generateSudokuPuzzle } from '../../lib/puzzles/sudoku/generator';
import { createEmptyGrid } from '../../lib/puzzles/sudoku/grid';
import {
  createEmptySudokuNotes,
  toggleNoteDigit,
} from '../../lib/puzzles/sudoku/notes';
import type { SudokuNotes, SudokuPlayState } from '../../lib/puzzles/types';

function i18nWrapper({ children }: { children: ReactNode }) {
  return <I18nTestProvider locale="zh">{children}</I18nTestProvider>;
}

function firstEmptyCell(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] === 0) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

function firstGivenCell(givens: number[][]): { row: number; col: number } {
  for (let row = 0; row < givens.length; row += 1) {
    for (let col = 0; col < givens[row].length; col += 1) {
      if (givens[row][col] !== 0) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

describe('useSudokuBoard', () => {
  it('selects given cells for peer and same-digit highlight without enabling numpad', () => {
    const puzzle = generateSudokuPuzzle(404);
    const updatePlayState = jest.fn();
    const empty = firstEmptyCell(puzzle.givens);
    const given = firstGivenCell(puzzle.givens);

    const { result } = renderHook(() =>
      useSudokuBoard({
        boardKey: 'test',
        givens: puzzle.givens,
        playState: createEmptyGrid(),
        updatePlayState,
      }),
      { wrapper: i18nWrapper },
    );

    act(() => {
      result.current.handleSelect(given.row, given.col);
    });
    expect(result.current.selected).toEqual(given);
    expect(result.current.numpadDisabled).toBe(true);
    expect(result.current.statusHint).toBeNull();

    act(() => {
      result.current.handleSelect(empty.row, empty.col);
    });
    expect(result.current.selected).toEqual(empty);
    expect(result.current.numpadDisabled).toBe(false);
    expect(result.current.statusHint).toBeNull();
  });

  it('disables numpad until an editable cell is selected', () => {
    const puzzle = generateSudokuPuzzle(101);
    const updatePlayState = jest.fn();

    const { result } = renderHook(() =>
      useSudokuBoard({
        boardKey: 'test',
        givens: puzzle.givens,
        playState: createEmptyGrid(),
        updatePlayState,
      }),
      { wrapper: i18nWrapper },
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
        boardKey: 'test',
        givens: puzzle.givens,
        playState,
        updatePlayState,
      }),
      { wrapper: i18nWrapper },
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

  it('clears editable cell on long press', () => {
    const puzzle = generateSudokuPuzzle(303);
    const updatePlayState = jest.fn();
    const { row, col } = firstEmptyCell(puzzle.givens);
    const playState = createEmptyGrid();
    playState[row][col] = 5;

    const { result } = renderHook(() =>
      useSudokuBoard({
        boardKey: 'test',
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
    const next = updatePlayState.mock.calls.at(-1)?.[0];
    expect(next[row][col]).toBe(0);
  });

  it('undo restores playState and notes together after digit clears notes', () => {
    const puzzle = generateSudokuPuzzle(505);
    const { row, col } = firstEmptyCell(puzzle.givens);
    let playState: SudokuPlayState = createEmptyGrid();
    let notes: SudokuNotes = createEmptySudokuNotes();
    notes[row]![col] = toggleNoteDigit(0, 3);

    const updatePlayState = jest.fn((next: SudokuPlayState) => {
      playState = next;
    });
    const updateSudokuNotes = jest.fn((next: SudokuNotes | null) => {
      notes = next ?? createEmptySudokuNotes();
    });

    const { result, rerender } = renderHook(
      ({ play, noteGrid }: { play: SudokuPlayState; noteGrid: SudokuNotes }) =>
        useSudokuBoard({
          boardKey: 'notes-undo',
          givens: puzzle.givens,
          playState: play,
          updatePlayState,
          sudokuNotes: noteGrid,
          updateSudokuNotes,
        }),
      {
        wrapper: i18nWrapper,
        initialProps: { play: playState, noteGrid: notes },
      },
    );

    act(() => {
      result.current.handleSelect(row, col);
    });
    act(() => {
      result.current.handleDigit(7);
    });

    expect(updatePlayState).toHaveBeenCalledTimes(1);
    expect(updateSudokuNotes).toHaveBeenCalledTimes(1);
    expect(playState[row][col]).toBe(7);
    expect(notes[row]![col]).toBe(0);
    expect(result.current.canUndo).toBe(true);

    rerender({ play: playState, noteGrid: notes });

    act(() => {
      result.current.undo();
    });

    expect(playState[row][col]).toBe(0);
    expect(notes[row]![col]).toBe(toggleNoteDigit(0, 3));
  });

  it('undo restores notes-only edits', () => {
    const puzzle = generateSudokuPuzzle(606);
    const { row, col } = firstEmptyCell(puzzle.givens);
    let playState: SudokuPlayState = createEmptyGrid();
    let notes: SudokuNotes = createEmptySudokuNotes();

    const updatePlayState = jest.fn((next: SudokuPlayState) => {
      playState = next;
    });
    const updateSudokuNotes = jest.fn((next: SudokuNotes | null) => {
      notes = next ?? createEmptySudokuNotes();
    });

    const { result, rerender } = renderHook(
      ({ play, noteGrid }: { play: SudokuPlayState; noteGrid: SudokuNotes }) =>
        useSudokuBoard({
          boardKey: 'notes-only-undo',
          givens: puzzle.givens,
          playState: play,
          updatePlayState,
          sudokuNotes: noteGrid,
          updateSudokuNotes,
        }),
      {
        wrapper: i18nWrapper,
        initialProps: { play: playState, noteGrid: notes },
      },
    );

    act(() => {
      result.current.handleSelect(row, col);
      result.current.toggleNotesMode();
    });
    act(() => {
      result.current.handleDigit(2);
    });

    expect(updatePlayState).not.toHaveBeenCalled();
    expect(notes[row]![col]).toBe(toggleNoteDigit(0, 2));
    expect(result.current.canUndo).toBe(true);

    rerender({ play: playState, noteGrid: notes });

    act(() => {
      result.current.undo();
    });

    expect(notes[row]![col]).toBe(0);
    expect(playState[row][col]).toBe(0);
  });
});
