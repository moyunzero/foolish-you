import { useCallback, useMemo, useRef, useState } from 'react';

import { cloneGrid, type CellCoord } from '../lib/puzzles/nonogram/grid';
import { NONOGRAM_EMPTY } from '../lib/puzzles/nonogram/spec';
import { cycleCellValue, isCompleteAndValid } from '../lib/puzzles/nonogram/validate';
import { useI18n } from '../lib/i18n';
import type { NonogramPlayState, NonogramPuzzle } from '../lib/puzzles/types';
import { createUndoStack } from '../lib/undo/createUndoStack';

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
  const { strings } = useI18n();
  const hints = strings.ui.hooks.nonogram;
  const [selected, setSelected] = useState<CellCoord | null>(null);
  const undoStackRef = useRef(createUndoStack<NonogramPlayState>());
  const [undoEpoch, setUndoEpoch] = useState(0);

  const canComplete = useMemo(
    () => isCompleteAndValid(playState, puzzle.solution),
    [playState, puzzle.solution],
  );

  const statusHint = useMemo(() => {
    if (canComplete) return hints.complete;
    return hints.tapHint;
  }, [canComplete, hints]);

  const canUndo = undoStackRef.current.canUndo();
  void undoEpoch;

  const commitPlayState = useCallback(
    (next: NonogramPlayState) => {
      undoStackRef.current.push(cloneGrid(playState));
      updatePlayState(next);
      setUndoEpoch((n) => n + 1);
    },
    [playState, updatePlayState],
  );

  const undo = useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (prev === undefined) return;
    updatePlayState(prev);
    setUndoEpoch((n) => n + 1);
  }, [updatePlayState]);

  const handlePress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      const next = cloneGrid(playState);
      next[row]![col] = cycleCellValue(next[row]![col]!);
      commitPlayState(next);
    },
    [playState, commitPlayState],
  );

  const handleLongPress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      if (playState[row]![col] === NONOGRAM_EMPTY) return;

      const next = cloneGrid(playState);
      next[row]![col] = NONOGRAM_EMPTY;
      commitPlayState(next);
    },
    [playState, commitPlayState],
  );

  return {
    selected,
    canComplete,
    statusHint,
    canUndo,
    undo,
    handlePress,
    handleLongPress,
  };
}
