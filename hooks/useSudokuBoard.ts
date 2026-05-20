import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';

import type { CellCoord } from '../lib/puzzles/sudoku/grid';
import { cloneGrid } from '../lib/puzzles/sudoku/grid';
import { getDigitsUsedInUnit } from '../lib/puzzles/sudoku/display';
import {
  getConflictCells,
  isCompleteAndValid,
} from '../lib/puzzles/sudoku/validate';
import type { SudokuGivens, SudokuPlayState } from '../lib/puzzles/types';

function isSudokuEditable(givens: SudokuGivens, row: number, col: number): boolean {
  return givens[row][col] === 0;
}

type UseSudokuBoardParams = {
  givens: SudokuGivens;
  playState: SudokuPlayState;
  updatePlayState: (next: SudokuPlayState) => void;
};

export function useSudokuBoard({
  givens,
  playState,
  updatePlayState,
}: UseSudokuBoardParams) {
  const [selected, setSelected] = useState<CellCoord | null>(null);

  const conflicts = useMemo(
    () => getConflictCells(playState, givens),
    [playState, givens],
  );

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
    if (canComplete) return '全部填对啦，可以收工';
    if (conflicts.length > 0) return '有冲突，检查一下标红的格子';
    if (numpadDisabled) return '先点一个空格，再选数字';
    return null;
  }, [canComplete, conflicts.length, numpadDisabled]);

  const handleSelect = useCallback((row: number, col: number) => {
    setSelected({ row, col });
  }, []);

  const handleDigit = useCallback(
    (digit: number) => {
      if (selected == null) return;
      if (!isSudokuEditable(givens, selected.row, selected.col)) return;

      const next = cloneGrid(playState);
      next[selected.row][selected.col] = digit;
      updatePlayState(next);

      const cellConflict = getConflictCells(next, givens).some(
        (c) => c.row === selected.row && c.col === selected.col,
      );
      if (cellConflict) Vibration.vibrate(12);
    },
    [selected, givens, playState, updatePlayState],
  );

  const handleClear = useCallback(() => {
    if (selected == null) return;
    if (!isSudokuEditable(givens, selected.row, selected.col)) return;

    const next = cloneGrid(playState);
    next[selected.row][selected.col] = 0;
    updatePlayState(next);
  }, [selected, givens, playState, updatePlayState]);

  return {
    selected,
    conflicts,
    canComplete,
    dimmedDigits,
    numpadDisabled,
    statusHint,
    handleSelect,
    handleDigit,
    handleClear,
  };
}
