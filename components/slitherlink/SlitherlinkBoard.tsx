import { Pressable, Text, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import { colors } from '../../constants/design';
import {
  lineCountAroundCell,
  unknownCountAroundCell,
} from '../../lib/puzzles/slitherlink/edges';
import { findNearestSlitherlinkEdge } from '../../lib/puzzles/slitherlink/hitTest';
import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type EdgeCoord,
  type EdgeOrientation,
  type EdgeState,
  type SlitherlinkPlayState,
  type SlitherlinkPuzzle,
} from '../../lib/puzzles/slitherlink/spec';
import { useI18n } from '../../lib/i18n';
import type { Strings } from '../../lib/i18n/types';

type SlitherlinkBoardProps = {
  puzzle: SlitherlinkPuzzle;
  playState: SlitherlinkPlayState;
  conflicts: { h: boolean[][]; v: boolean[][] };
  selectedEdge: EdgeCoord | null;
  onPressEdge: (orientation: EdgeOrientation, row: number, col: number) => void;
  onLongPressEdge: (
    orientation: EdgeOrientation,
    row: number,
    col: number,
  ) => void;
  maxWidth: number;
};

export const SLITHERLINK_BOARD_INSET = 20;
const DOT_RADIUS = 3.5;
const LINE_THICK = 4;
const BLANK_MARK_SIZE = 13;

function edgeStateKey(
  state: EdgeState,
): 'line' | 'blank' | 'unknown' {
  if (state === EDGE_LINE) return 'line';
  if (state === EDGE_BLANK) return 'blank';
  return 'unknown';
}

function edgeA11yLabel(
  grid: Strings['ui']['grid'],
  orientation: EdgeOrientation,
  row: number,
  col: number,
  state: EdgeState,
  conflict: boolean,
): string {
  return grid.slitherlinkEdgeA11y(
    row,
    col,
    orientation,
    edgeStateKey(state),
    conflict,
  );
}

function isClueConflict(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
  row: number,
  col: number,
): boolean {
  const clue = clues[row][col];
  if (clue == null) return false;
  const lines = lineCountAroundCell(play, row, col);
  const unknowns = unknownCountAroundCell(play, row, col);
  return lines > clue || (unknowns === 0 && lines !== clue);
}

function dotLeft(inset: number, cellStep: number, col: number): number {
  return inset + col * cellStep;
}

function dotTop(inset: number, cellStep: number, row: number): number {
  return inset + row * cellStep;
}

function segmentEndpoints(
  orientation: EdgeOrientation,
  row: number,
  col: number,
  inset: number,
  cellStep: number,
): { x0: number; y0: number; x1: number; y1: number } {
  if (orientation === 'h') {
    const y = dotTop(inset, cellStep, row);
    return {
      x0: dotLeft(inset, cellStep, col),
      y0: y,
      x1: dotLeft(inset, cellStep, col + 1),
      y1: y,
    };
  }
  const x = dotLeft(inset, cellStep, col);
  return {
    x0: x,
    y0: dotTop(inset, cellStep, row),
    x1: x,
    y1: dotTop(inset, cellStep, row + 1),
  };
}

function EdgeSegment({
  orientation,
  row,
  col,
  state,
  conflict,
  inset,
  cellStep,
}: {
  orientation: EdgeOrientation;
  row: number;
  col: number;
  state: EdgeState;
  conflict: boolean;
  inset: number;
  cellStep: number;
}) {
  const { x0, y0, x1, y1 } = segmentEndpoints(
    orientation,
    row,
    col,
    inset,
    cellStep,
  );
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const isH = orientation === 'h';
  const segLen = isH ? x1 - x0 : y1 - y0;

  if (state === EDGE_UNKNOWN) {
    return null;
  }

  if (state === EDGE_BLANK) {
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: midX - BLANK_MARK_SIZE / 2,
          top: midY - BLANK_MARK_SIZE / 2,
          width: BLANK_MARK_SIZE,
          height: BLANK_MARK_SIZE,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: BLANK_MARK_SIZE,
            lineHeight: BLANK_MARK_SIZE,
            fontFamily: 'SpaceMono_400Regular',
            color: conflict ? colors.sudokuError : colors.muted,
            textAlign: 'center',
          }}
        >
          ×
        </Text>
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: midX - (isH ? segLen / 2 : LINE_THICK / 2),
        top: midY - (isH ? LINE_THICK / 2 : segLen / 2),
        width: isH ? segLen : LINE_THICK,
        height: isH ? LINE_THICK : segLen,
        backgroundColor: conflict ? colors.sudokuError : colors.accentSunset,
        borderRadius: 2,
      }}
    />
  );
}

export default function SlitherlinkBoard({
  puzzle,
  playState,
  conflicts,
  selectedEdge,
  onPressEdge,
  onLongPressEdge,
  maxWidth,
}: SlitherlinkBoardProps) {
  const { strings } = useI18n();
  const grid = strings.ui.grid;
  const innerMax = Math.max(1, maxWidth - SLITHERLINK_BOARD_INSET * 2);
  const cellStep = Math.max(32, Math.floor(innerMax / SLITHERLINK_SIZE));
  const gridSize = cellStep * SLITHERLINK_SIZE;
  const containerSize = gridSize + SLITHERLINK_BOARD_INSET * 2;
  const clueFontSize = Math.max(16, Math.floor(cellStep * 0.46));

  const handleTouch = (event: GestureResponderEvent, longPress: boolean) => {
    const { locationX, locationY } = event.nativeEvent;
    const hit = findNearestSlitherlinkEdge(
      locationX,
      locationY,
      SLITHERLINK_BOARD_INSET,
      cellStep,
    );
    if (hit == null) return;
    if (longPress) {
      onLongPressEdge(hit.orientation, hit.row, hit.col);
    } else {
      onPressEdge(hit.orientation, hit.row, hit.col);
    }
  };

  const selectedA11y =
    selectedEdge != null
      ? (() => {
          const state =
            selectedEdge.orientation === 'h'
              ? playState.h[selectedEdge.row][selectedEdge.col]
              : playState.v[selectedEdge.row][selectedEdge.col];
          const conflict =
            selectedEdge.orientation === 'h'
              ? conflicts.h[selectedEdge.row][selectedEdge.col]
              : conflicts.v[selectedEdge.row][selectedEdge.col];
          return edgeA11yLabel(
            grid,
            selectedEdge.orientation,
            selectedEdge.row,
            selectedEdge.col,
            state,
            conflict,
          );
        })()
      : strings.ui.hooks.slitherlink.tapHint;

  return (
    <Pressable
      testID="slitherlink-board-touch"
      accessibilityRole="adjustable"
      accessibilityLabel={selectedA11y}
      delayLongPress={400}
      onPress={(e) => handleTouch(e, false)}
      onLongPress={(e) => handleTouch(e, true)}
      style={{
        width: containerSize,
        height: containerSize,
        alignSelf: 'center',
        position: 'relative',
      }}
    >
        {Array.from({ length: SLITHERLINK_SIZE + 1 }, (_, pr) =>
          Array.from({ length: SLITHERLINK_SIZE + 1 }, (_, pc) => (
            <View
              key={`dot-${pr}-${pc}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: dotLeft(SLITHERLINK_BOARD_INSET, cellStep, pc) - DOT_RADIUS,
                top: dotTop(SLITHERLINK_BOARD_INSET, cellStep, pr) - DOT_RADIUS,
                width: DOT_RADIUS * 2,
                height: DOT_RADIUS * 2,
                borderRadius: DOT_RADIUS,
                backgroundColor: colors.muted,
                opacity: 0.5,
              }}
            />
          )),
        )}

        {Array.from({ length: SLITHERLINK_SIZE }, (_, row) =>
          Array.from({ length: SLITHERLINK_SIZE }, (_, col) => {
            const clue = puzzle.clues[row][col];
            if (clue == null) return null;
            const clueConflict = isClueConflict(
              playState,
              puzzle.clues,
              row,
              col,
            );
            const cx =
              dotLeft(SLITHERLINK_BOARD_INSET, cellStep, col) + cellStep / 2;
            const cy =
              dotTop(SLITHERLINK_BOARD_INSET, cellStep, row) + cellStep / 2;
            return (
              <Text
                key={`clue-${row}-${col}`}
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  position: 'absolute',
                  left: cx - cellStep / 2,
                  top: cy - cellStep / 2,
                  width: cellStep,
                  height: cellStep,
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  fontFamily: 'SpaceMono_400Regular',
                  fontSize: clueFontSize,
                  lineHeight: cellStep,
                  color: clueConflict ? colors.sudokuError : colors.sudokuGiven,
                }}
              >
                {String(clue)}
              </Text>
            );
          }),
        )}

        {Array.from({ length: SLITHERLINK_SIZE + 1 }, (_, row) =>
          Array.from({ length: SLITHERLINK_SIZE }, (_, col) => (
            <EdgeSegment
              key={`h-${row}-${col}`}
              orientation="h"
              row={row}
              col={col}
              state={playState.h[row][col]}
              conflict={conflicts.h[row][col]}
              inset={SLITHERLINK_BOARD_INSET}
              cellStep={cellStep}
            />
          )),
        )}

        {Array.from({ length: SLITHERLINK_SIZE }, (_, row) =>
          Array.from({ length: SLITHERLINK_SIZE + 1 }, (_, col) => (
            <EdgeSegment
              key={`v-${row}-${col}`}
              orientation="v"
              row={row}
              col={col}
              state={playState.v[row][col]}
              conflict={conflicts.v[row][col]}
              inset={SLITHERLINK_BOARD_INSET}
              cellStep={cellStep}
            />
          )),
        )}
    </Pressable>
  );
}
