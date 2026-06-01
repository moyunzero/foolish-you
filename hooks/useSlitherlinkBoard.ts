import { useCallback, useMemo, useState } from 'react';
import { Vibration } from 'react-native';

import { useI18n } from '../lib/i18n';
import {
  clonePlayState,
  cycleEdgeState,
  edgeAt,
  setEdgeAt,
} from '../lib/puzzles/slitherlink/edges';
import {
  EDGE_UNKNOWN,
  type EdgeCoord,
  type EdgeOrientation,
  type SlitherlinkPlayState,
  type SlitherlinkPuzzle,
} from '../lib/puzzles/slitherlink/spec';
import {
  getConflictEdges,
  isCompleteAndValid,
} from '../lib/puzzles/slitherlink/validate';

type UseSlitherlinkBoardParams = {
  puzzle: SlitherlinkPuzzle;
  playState: SlitherlinkPlayState;
  updatePlayState: (next: SlitherlinkPlayState) => void;
};

function hasAnyConflict(conflicts: { h: boolean[][]; v: boolean[][] }): boolean {
  return (
    conflicts.h.some((row) => row.some(Boolean)) ||
    conflicts.v.some((row) => row.some(Boolean))
  );
}

function edgeInConflict(
  conflicts: { h: boolean[][]; v: boolean[][] },
  orientation: EdgeOrientation,
  row: number,
  col: number,
): boolean {
  return orientation === 'h'
    ? conflicts.h[row][col]
    : conflicts.v[row][col];
}

export function useSlitherlinkBoard({
  puzzle,
  playState,
  updatePlayState,
}: UseSlitherlinkBoardParams) {
  const { strings } = useI18n();
  const hints = strings.ui.hooks.slitherlink;
  const [selectedEdge, setSelectedEdge] = useState<EdgeCoord | null>(null);

  const conflicts = useMemo(
    () => getConflictEdges(playState, puzzle),
    [playState, puzzle],
  );

  const canComplete = useMemo(
    () => isCompleteAndValid(playState, puzzle),
    [playState, puzzle],
  );

  const statusHint = useMemo(() => {
    if (canComplete) return hints.complete;
    if (hasAnyConflict(conflicts)) return hints.conflict;
    return hints.tapHint;
  }, [canComplete, conflicts, hints]);

  const applyEdgeUpdate = useCallback(
    (
      orientation: EdgeOrientation,
      row: number,
      col: number,
      nextState: SlitherlinkPlayState,
    ) => {
      const nextEdgeState = edgeAt(nextState, orientation, row, col);
      if (nextEdgeState === EDGE_UNKNOWN) {
        setSelectedEdge(null);
      } else {
        setSelectedEdge({ orientation, row, col });
      }
      updatePlayState(nextState);
      const nextConflicts = getConflictEdges(nextState, puzzle);
      if (edgeInConflict(nextConflicts, orientation, row, col)) {
        Vibration.vibrate(12);
      }
    },
    [puzzle, updatePlayState],
  );

  const handlePressEdge = useCallback(
    (orientation: EdgeOrientation, row: number, col: number) => {
      const current = edgeAt(playState, orientation, row, col);
      const next = clonePlayState(playState);
      setEdgeAt(next, orientation, row, col, cycleEdgeState(current));
      applyEdgeUpdate(orientation, row, col, next);
    },
    [applyEdgeUpdate, playState],
  );

  const handleLongPressEdge = useCallback(
    (orientation: EdgeOrientation, row: number, col: number) => {
      const current = edgeAt(playState, orientation, row, col);
      if (current === EDGE_UNKNOWN) return;

      const next = clonePlayState(playState);
      setEdgeAt(next, orientation, row, col, EDGE_UNKNOWN);
      applyEdgeUpdate(orientation, row, col, next);
    },
    [applyEdgeUpdate, playState],
  );

  return {
    selectedEdge,
    conflicts,
    canComplete,
    statusHint,
    handlePressEdge,
    handleLongPressEdge,
  };
}
