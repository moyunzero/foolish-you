import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';

import type { CellCoord } from '../lib/puzzles/sudoku/grid';
import { cloneGrid } from '../lib/puzzles/sudoku/grid';
import { getDigitsUsedInUnit } from '../lib/puzzles/sudoku/display';
import {
  getConflictCells,
  isCompleteAndValid,
} from '../lib/puzzles/sudoku/validate';
import { useI18n } from '../lib/i18n';
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
  const { strings } = useI18n();
  const hints = strings.ui.hooks.sudoku;
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
    if (canComplete) return hints.complete;
    if (conflicts.length > 0) return hints.conflict;
    // 未选格：引导点空格；已选格（含题目格同数高亮）：盘面反馈足够，不重复提示
    if (selected == null) return hints.selectCell;
    return null;
  }, [canComplete, conflicts.length, selected, hints]);

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

  const clearCell = useCallback(
    (row: number, col: number) => {
      if (!isSudokuEditable(givens, row, col)) return;
      if (playState[row][col] === 0) return;

      const next = cloneGrid(playState);
      next[row][col] = 0;
      updatePlayState(next);
    },
    [givens, playState, updatePlayState],
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
    handleSelect,
    handleDigit,
    handleClear,
    handleLongPress,
  };
}
