import { useCallback, useMemo, useRef, useState } from 'react';

import { feelConflict, feelLight, feelUndo } from '../lib/feel/haptics';
import type { CellCoord } from '../lib/puzzles/sudoku/grid';
import { cloneGrid } from '../lib/puzzles/sudoku/grid';
import { getDigitsUsedInUnit } from '../lib/puzzles/sudoku/display';
import {
  cloneSudokuNotes,
  createEmptySudokuNotes,
  toggleNoteDigit,
} from '../lib/puzzles/sudoku/notes';
import {
  getConflictCells,
  isCompleteAndValid,
} from '../lib/puzzles/sudoku/validate';
import { useI18n } from '../lib/i18n';
import type {
  SudokuGivens,
  SudokuNotes,
  SudokuPlayState,
} from '../lib/puzzles/types';
import { createUndoStack } from '../lib/undo/createUndoStack';

function isSudokuEditable(givens: SudokuGivens, row: number, col: number): boolean {
  return givens[row][col] === 0;
}

type UseSudokuBoardParams = {
  givens: SudokuGivens;
  playState: SudokuPlayState;
  updatePlayState: (next: SudokuPlayState) => void;
  sudokuNotes?: SudokuNotes | null;
  updateSudokuNotes?: (next: SudokuNotes | null) => void;
};

export function useSudokuBoard({
  givens,
  playState,
  updatePlayState,
  sudokuNotes,
  updateSudokuNotes,
}: UseSudokuBoardParams) {
  const { strings } = useI18n();
  const hints = strings.ui.hooks.sudoku;
  const [selected, setSelected] = useState<CellCoord | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const undoStackRef = useRef(createUndoStack<SudokuPlayState>());
  const [undoEpoch, setUndoEpoch] = useState(0);

  const notes = sudokuNotes ?? createEmptySudokuNotes();

  const conflicts = useMemo(
    () => getConflictCells(playState, givens),
    [playState, givens],
  );

  // D-09: completion ignores notes — only bare playState digits.
  const canComplete = useMemo(
    () => isCompleteAndValid(playState, givens),
    [playState, givens],
  );

  const dimmedDigits = useMemo(() => {
    if (selected == null) return new Set<number>();
    return getDigitsUsedInUnit(givens, playState, selected);
  }, [givens, playState, selected]);

  const numpadDisabled =
    selected == null ||
    !isSudokuEditable(givens, selected.row, selected.col);

  const statusHint = useMemo(() => {
    if (canComplete) return hints.complete;
    if (conflicts.length > 0) return hints.conflict;
    if (selected == null) return hints.selectCell;
    return null;
  }, [canComplete, conflicts.length, selected, hints]);

  const canUndo = undoStackRef.current.canUndo();
  void undoEpoch;

  const commitPlayState = useCallback(
    (next: SudokuPlayState) => {
      undoStackRef.current.push(cloneGrid(playState));
      updatePlayState(next);
      setUndoEpoch((n) => n + 1);
    },
    [playState, updatePlayState],
  );

  const commitNotes = useCallback(
    (next: SudokuNotes) => {
      updateSudokuNotes?.(next);
    },
    [updateSudokuNotes],
  );

  const undo = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (prev === undefined) return;
    feelUndo();
    updatePlayState(prev);
    setUndoEpoch((n) => n + 1);
  }, [updatePlayState]);

  const handleSelect = useCallback((row: number, col: number) => {
    setSelected({ row, col });
  }, []);

  const toggleNotesMode = useCallback(() => {
    setNotesMode((prev) => !prev);
  }, []);

  const handleDigit = useCallback(
    (digit: number) => {
      if (selected == null) return;
      if (!isSudokuEditable(givens, selected.row, selected.col)) return;

      if (notesMode) {
        // Notes mode: toggle candidate bitmask only — never write playState (D-10).
        const next = cloneSudokuNotes(notes);
        const cell = next[selected.row]![selected.col]!;
        next[selected.row]![selected.col] = toggleNoteDigit(cell, digit);
        commitNotes(next);
        feelLight();
        return;
      }

      if (playState[selected.row][selected.col] === digit) return;

      const next = cloneGrid(playState);
      next[selected.row][selected.col] = digit;
      // Clear notes under a filled digit for clarity.
      if (notes[selected.row]![selected.col] !== 0) {
        const nextNotes = cloneSudokuNotes(notes);
        nextNotes[selected.row]![selected.col] = 0;
        commitNotes(nextNotes);
      }
      commitPlayState(next);

      const cellConflict = getConflictCells(next, givens).some(
        (c) => c.row === selected.row && c.col === selected.col,
      );
      if (cellConflict) {
        feelConflict();
      } else {
        feelLight();
      }
    },
    [
      selected,
      givens,
      playState,
      notesMode,
      notes,
      commitPlayState,
      commitNotes,
    ],
  );

  const clearCell = useCallback(
    (row: number, col: number) => {
      if (!isSudokuEditable(givens, row, col)) return;

      if (notesMode) {
        if (notes[row]![col] === 0) return;
        const nextNotes = cloneSudokuNotes(notes);
        nextNotes[row]![col] = 0;
        commitNotes(nextNotes);
        feelLight();
        return;
      }

      if (playState[row][col] === 0) return;

      const next = cloneGrid(playState);
      next[row][col] = 0;
      commitPlayState(next);
      feelLight();
    },
    [givens, playState, notesMode, notes, commitPlayState, commitNotes],
  );

  const handleClear = useCallback(() => {
    if (selected == null) return;
    clearCell(selected.row, selected.col);
  }, [selected, clearCell]);

  const handleLongPress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      clearCell(row, col);
    },
    [clearCell],
  );

  return {
    selected,
    conflicts,
    canComplete,
    dimmedDigits,
    numpadDisabled,
    statusHint,
    canUndo,
    undo,
    notesMode,
    toggleNotesMode,
    sudokuNotes: notes,
    handleSelect,
    handleDigit,
    handleClear,
    handleLongPress,
  };
}
