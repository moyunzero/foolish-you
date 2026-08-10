import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createDragHapticCoalesce,
  feelLight,
  feelUndo,
} from '../lib/feel/haptics';
import { cloneGrid, type CellCoord } from '../lib/puzzles/nonogram/grid';
import { NONOGRAM_EMPTY } from '../lib/puzzles/nonogram/spec';
import { cycleCellValue, isCompleteAndValid } from '../lib/puzzles/nonogram/validate';
import { useI18n } from '../lib/i18n';
import type {
  NonogramCellState,
  NonogramPlayState,
  NonogramPuzzle,
} from '../lib/puzzles/types';
import { createUndoStack } from '../lib/undo/createUndoStack';

type UseNonogramBoardParams = {
  /** Clears ephemeral undo when puzzle identity changes (D-05). */
  boardKey: string;
  puzzle: NonogramPuzzle;
  playState: NonogramPlayState;
  updatePlayState: (next: NonogramPlayState) => void;
};

type DragStroke = {
  pre: NonogramPlayState;
  draft: NonogramPlayState;
  paintValue: NonogramCellState;
  changed: boolean;
};

export function useNonogramBoard({
  boardKey,
  puzzle,
  playState,
  updatePlayState,
}: UseNonogramBoardParams) {
  const { strings } = useI18n();
  const hints = strings.ui.hooks.nonogram;
  const [selected, setSelected] = useState<CellCoord | null>(null);
  const undoStackRef = useRef(createUndoStack<NonogramPlayState>());
  const [undoEpoch, setUndoEpoch] = useState(0);
  const strokeRef = useRef<DragStroke | null>(null);
  const dragHapticsRef = useRef(createDragHapticCoalesce());

  useEffect(() => {
    undoStackRef.current.clear();
    strokeRef.current = null;
    setUndoEpoch((n) => n + 1);
    setSelected(null);
  }, [boardKey]);

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
    feelUndo();
    updatePlayState(prev);
    setUndoEpoch((n) => n + 1);
  }, [updatePlayState]);

  const handlePress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      const next = cloneGrid(playState);
      next[row]![col] = cycleCellValue(next[row]![col]!);
      commitPlayState(next);
      feelLight();
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
      feelLight();
    },
    [playState, commitPlayState],
  );

  /** D-04/D-13: stroke begin — snapshot pre; paint in memory; no undo push yet. */
  const beginDragStroke = useCallback(
    (row: number, col: number) => {
      if (strokeRef.current != null) return;
      if (row < 0 || col < 0 || row >= puzzle.rows || col >= puzzle.cols) return;

      const paintValue = cycleCellValue(playState[row]![col]!);
      const pre = cloneGrid(playState);
      const draft = cloneGrid(playState);
      const prevCell = draft[row]![col]!;
      draft[row]![col] = paintValue;
      const changed = prevCell !== paintValue;
      strokeRef.current = { pre, draft, paintValue, changed };
      setSelected({ row, col });
      dragHapticsRef.current.onStrokeStart();
      if (changed) {
        updatePlayState(cloneGrid(draft));
      }
    },
    [playState, puzzle.rows, puzzle.cols, updatePlayState],
  );

  const moveDragStroke = useCallback(
    (row: number, col: number) => {
      const stroke = strokeRef.current;
      if (stroke == null) return;
      if (row < 0 || col < 0 || row >= puzzle.rows || col >= puzzle.cols) return;
      if (stroke.draft[row]![col] === stroke.paintValue) {
        setSelected({ row, col });
        return;
      }
      stroke.draft[row]![col] = stroke.paintValue;
      stroke.changed = true;
      setSelected({ row, col });
      dragHapticsRef.current.onStrokeCell();
      updatePlayState(cloneGrid(stroke.draft));
    },
    [puzzle.rows, puzzle.cols, updatePlayState],
  );

  /** One undo push of pre-stroke clone when any cell changed (D-04, D-13). */
  const endDragStroke = useCallback(() => {
    const stroke = strokeRef.current;
    strokeRef.current = null;
    dragHapticsRef.current.onStrokeEnd();
    if (stroke == null || !stroke.changed) return;
    undoStackRef.current.push(stroke.pre);
    setUndoEpoch((n) => n + 1);
  }, []);

  return {
    selected,
    canComplete,
    statusHint,
    canUndo,
    undo,
    handlePress,
    handleLongPress,
    beginDragStroke,
    moveDragStroke,
    endDragStroke,
  };
}
