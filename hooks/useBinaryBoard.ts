import { useCallback, useMemo, useRef, useState } from 'react';

import {
  createDragHapticCoalesce,
  feelConflict,
  feelLight,
  feelUndo,
} from '../lib/feel/haptics';
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
import { createUndoStack } from '../lib/undo/createUndoStack';

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

type DragStroke = {
  pre: BinaryPlayState;
  draft: BinaryPlayState;
  paintValue: number;
  changed: boolean;
};

export function useBinaryBoard({
  givens,
  playState,
  updatePlayState,
}: UseBinaryBoardParams) {
  const { strings } = useI18n();
  const hints = strings.ui.hooks.binary;
  const [selected, setSelected] = useState<CellCoord | null>(null);
  const undoStackRef = useRef(createUndoStack<BinaryPlayState>());
  const [undoEpoch, setUndoEpoch] = useState(0);
  const strokeRef = useRef<DragStroke | null>(null);
  const dragHapticsRef = useRef(createDragHapticCoalesce());

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

  const canUndo = undoStackRef.current.canUndo();
  void undoEpoch;

  const commitPlayState = useCallback(
    (next: BinaryPlayState) => {
      undoStackRef.current.push(cloneBinaryGrid(playState));
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
      if (!isBinaryEditable(givens, row, col)) return;

      const current = binaryCellValue(givens, playState, row, col);
      const next = cloneBinaryGrid(playState);
      next[row][col] = cycleBinaryValue(current);
      commitPlayState(next);

      const cellConflict = getBinaryConflictCells(next, givens).some(
        (c) => c.row === row && c.col === col,
      );
      if (cellConflict) {
        feelConflict();
      } else {
        feelLight();
      }
    },
    [givens, playState, commitPlayState],
  );

  const handleLongPress = useCallback(
    (row: number, col: number) => {
      setSelected({ row, col });
      if (!isBinaryEditable(givens, row, col)) return;
      if (playState[row][col] === BINARY_EMPTY) return;

      const next = cloneBinaryGrid(playState);
      next[row][col] = BINARY_EMPTY;
      commitPlayState(next);
      feelLight();
    },
    [givens, playState, commitPlayState],
  );

  /** D-04/D-13: stroke begin — snapshot pre; paint in memory; no undo push yet. */
  const beginDragStroke = useCallback(
    (row: number, col: number) => {
      if (!isBinaryEditable(givens, row, col)) return;
      if (strokeRef.current != null) return;

      const current = binaryCellValue(givens, playState, row, col);
      const paintValue = cycleBinaryValue(current);
      const pre = cloneBinaryGrid(playState);
      const draft = cloneBinaryGrid(playState);
      const prevCell = draft[row]![col]!;
      draft[row]![col] = paintValue;
      const changed = prevCell !== paintValue;
      strokeRef.current = { pre, draft, paintValue, changed };
      setSelected({ row, col });
      dragHapticsRef.current.onStrokeStart();
      if (changed) {
        updatePlayState(cloneBinaryGrid(draft));
      }
    },
    [givens, playState, updatePlayState],
  );

  const moveDragStroke = useCallback(
    (row: number, col: number) => {
      const stroke = strokeRef.current;
      if (stroke == null) return;
      if (!isBinaryEditable(givens, row, col)) return;
      if (stroke.draft[row]![col] === stroke.paintValue) {
        setSelected({ row, col });
        return;
      }
      stroke.draft[row]![col] = stroke.paintValue;
      stroke.changed = true;
      setSelected({ row, col });
      dragHapticsRef.current.onStrokeCell();
      updatePlayState(cloneBinaryGrid(stroke.draft));
    },
    [givens, updatePlayState],
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
    conflicts,
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
