import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';

import {
  BINARY_EMPTY,
  cloneGrid as cloneBinaryGrid,
  type CellCoord,
} from '../lib/puzzles/binary/grid';
import {
  getConflictCells as getBinaryConflictCells,
  isCompleteAndValid as isBinaryComplete,
} from '../lib/puzzles/binary/validate';
import { useI18n } from '../lib/i18n';
import type { BinaryGivens, BinaryPlayState } from '../lib/puzzles/types';

function isBinaryEditable(givens: BinaryGivens, row: number, col: number): boolean {
  return givens[row][col] === BINARY_EMPTY;
}

function cycleBinaryValue(value: number): number {
  if (value === BINARY_EMPTY) return 1;
  if (value === 1) return 2;
  return BINARY_EMPTY;
}

function binaryCellValue(
  givens: BinaryGivens,
  play: BinaryPlayState,
  row: number,
  col: number,
): number {
  if (givens[row][col] !== BINARY_EMPTY) return givens[row][col];
  return play[row][col];
}

type UseBinaryBoardParams = {
  givens: BinaryGivens;
  playState: BinaryPlayState;
  updatePlayState: (next: BinaryPlayState) => void;
};

export function useBinaryBoard({
  givens,
  playState,
  updatePlayState,
}: UseBinaryBoardParams) {
  const { strings } = useI18n();
  const hints = strings.ui.hooks.binary;
  const [selected, setSelected] = useState<CellCoord | null>(null);

  const conflicts = useMemo(
    () => getBinaryConflictCells(playState, givens),
    [playState, givens],
  );

  const canComplete = useMemo(
    () => isBinaryComplete(playState, givens),
    [playState, givens],
  );

  const statusHint = useMemo(() => {
    if (canComplete) return hints.complete;
    if (conflicts.length > 0) return hints.conflict;
    return hints.tapHint;
  }, [canComplete, conflicts.length, hints]);

  const handlePress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      if (!isBinaryEditable(givens, row, col)) return;

      const current = binaryCellValue(givens, playState, row, col);
      const next = cloneBinaryGrid(playState);
      next[row][col] = cycleBinaryValue(current);
      updatePlayState(next);

      const cellConflict = getBinaryConflictCells(next, givens).some(
        (c) => c.row === row && c.col === col,
      );
      if (cellConflict) Vibration.vibrate(12);
    },
    [givens, playState, updatePlayState],
  );

  const handleLongPress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      if (!isBinaryEditable(givens, row, col)) return;
      if (playState[row][col] === BINARY_EMPTY) return;

      const next = cloneBinaryGrid(playState);
      next[row][col] = BINARY_EMPTY;
      updatePlayState(next);
    },
    [givens, playState, updatePlayState],
  );

  return {
    selected,
    conflicts,
    canComplete,
    statusHint,
    handlePress,
    handleLongPress,
  };
}
