import { useCallback, useMemo, useState } from 'react';

import { cloneGrid, type CellCoord } from '../lib/puzzles/nonogram/grid';
import { NONOGRAM_EMPTY } from '../lib/puzzles/nonogram/spec';
import { cycleCellValue, isCompleteAndValid } from '../lib/puzzles/nonogram/validate';
import type { NonogramPlayState, NonogramPuzzle } from '../lib/puzzles/types';

type UseNonogramBoardParams = {
  puzzle: NonogramPuzzle;
  playState: NonogramPlayState;
  updatePlayState: (next: NonogramPlayState) => void;
};

export function useNonogramBoard({
  puzzle,
  playState,
  updatePlayState,
}: UseNonogramBoardParams) {
  const [selected, setSelected] = useState<CellCoord | null>(null);

  const canComplete = useMemo(
    () => isCompleteAndValid(playState, puzzle.solution),
    [playState, puzzle.solution],
  );

  const statusHint = useMemo(() => {
    if (canComplete) return '图案对了，可以收工';
    return '点格子切换 · 长按清空';
  }, [canComplete]);

  const handlePress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      const next = cloneGrid(playState);
      next[row]![col] = cycleCellValue(next[row]![col]!);
      updatePlayState(next);
    },
    [playState, updatePlayState],
  );

  const handleLongPress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      if (playState[row]![col] === NONOGRAM_EMPTY) return;

      const next = cloneGrid(playState);
      next[row]![col] = NONOGRAM_EMPTY;
      updatePlayState(next);
    },
    [playState, updatePlayState],
  );

  return {
    selected,
    canComplete,
    statusHint,
    handlePress,
    handleLongPress,
  };
}
