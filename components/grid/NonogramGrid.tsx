import { useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { colors } from '../../constants/design';
import type { CellCoord } from '../../lib/puzzles/nonogram/grid';
import {
  NONOGRAM_CROSS,
  NONOGRAM_EMPTY,
  NONOGRAM_FILL,
  type NonogramCell,
} from '../../lib/puzzles/nonogram/spec';
import { useI18n } from '../../lib/i18n';
import type { Strings } from '../../lib/i18n/types';
import type { NonogramPlayState } from '../../lib/puzzles/types';

type NonogramGridProps = {
  rows: number;
  cols: number;
  rowClues: number[][];
  colClues: number[][];
  playState: NonogramPlayState;
  selected: CellCoord | null;
  maxWidth: number;
  onPressCell: (row: number, col: number) => void;
  onLongPressCell: (row: number, col: number) => void;
  onDragStrokeBegin: (row: number, col: number) => void;
  onDragStrokeMove: (row: number, col: number) => void;
  onDragStrokeEnd: () => void;
};

function maxClueCount(clues: number[][]): number {
  return clues.reduce((max, line) => Math.max(max, line.length), 0);
}

function cellA11yLabel(
  grid: Strings['ui']['grid'],
  row: number,
  col: number,
  value: NonogramCell,
): string {
  const pos = grid.rowCol(row, col);
  if (value === NONOGRAM_EMPTY) return `${pos}${grid.empty}`;
  if (value === NONOGRAM_FILL) return `${pos}${grid.filled}`;
  return `${pos}${grid.marked}`;
}

function cellBackground(
  value: NonogramCell,
  isSelected: boolean,
  highlightRow: boolean,
  highlightCol: boolean,
): string | undefined {
  if (value === NONOGRAM_FILL) return 'rgba(255, 122, 23, 0.85)';
  if (isSelected) return 'rgba(255, 255, 255, 0.14)';
  if (highlightRow || highlightCol) return 'rgba(255, 255, 255, 0.06)';
  return undefined;
}

function ClueText({
  value,
  size,
  testID,
}: {
  value: number;
  size: number;
  testID?: string;
}) {
  if (value === 0) return null;
  return (
    <Text
      testID={testID}
      style={{
        fontFamily: 'SpaceMono_400Regular',
        fontSize: Math.max(8, size * 0.38),
        lineHeight: Math.max(10, size * 0.42),
        color: colors.muted,
        textAlign: 'center',
      }}
    >
      {value}
    </Text>
  );
}

export default function NonogramGrid({
  rows,
  cols,
  rowClues,
  colClues,
  playState,
  selected,
  maxWidth,
  onPressCell,
  onLongPressCell,
  onDragStrokeBegin,
  onDragStrokeMove,
  onDragStrokeEnd,
}: NonogramGridProps) {
  const { strings } = useI18n();
  const grid = strings.ui.grid;
  const maxRowClues = maxClueCount(rowClues);
  const maxColClues = maxClueCount(colClues);
  const clueBand = Math.max(maxRowClues, maxColClues, 1);

  const gridInner = maxWidth - clueBand * 14 - 8;
  const cellSize = Math.floor(Math.min(gridInner / cols, 36));
  const clueColWidth = clueBand * Math.max(12, cellSize * 0.55);
  const clueRowHeight = clueBand * Math.max(12, cellSize * 0.55);
  const suppressPressRef = useRef(false);

  const cellFromXY = (x: number, y: number): CellCoord | null => {
    if (cellSize <= 0) return null;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
    return { row, col };
  };

  // D-12 strategy: failOffsetY-first — clearly vertical flicks fail pan (scroll wins);
  // ~12px horizontal activates pan, then stroke paints freely in 2D.
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .maxPointers(1)
        .activeOffsetX([-12, 12])
        .failOffsetY([-16, 16])
        .onStart((e) => {
          const cell = cellFromXY(e.x, e.y);
          if (cell == null) return;
          suppressPressRef.current = true;
          onDragStrokeBegin(cell.row, cell.col);
        })
        .onUpdate((e) => {
          const cell = cellFromXY(e.x, e.y);
          if (cell == null) return;
          onDragStrokeMove(cell.row, cell.col);
        })
        .onFinalize(() => {
          onDragStrokeEnd();
        }),
    [
      cellSize,
      rows,
      cols,
      onDragStrokeBegin,
      onDragStrokeMove,
      onDragStrokeEnd,
    ],
  );

  return (
    <View style={{ maxWidth, alignSelf: 'center' }}>
      <View className="flex-row">
        <View style={{ width: clueColWidth }} />
        <View className="flex-row" style={{ gap: 0 }}>
          {Array.from({ length: cols }, (_, col) => (
            <View
              key={`col-clue-${col}`}
              style={{
                width: cellSize,
                height: clueRowHeight,
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 2,
              }}
            >
              {colClues[col]!.map((n, idx) => (
                <ClueText
                  key={`${col}-${idx}`}
                  testID={`col-clue-${col}-${idx}`}
                  value={n}
                  size={cellSize}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row">
        <View>
          {Array.from({ length: rows }, (_, row) => (
            <View
              key={`row-clue-${row}`}
              style={{
                width: clueColWidth,
                height: cellSize,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 4,
                gap: 2,
              }}
            >
              {rowClues[row]!.map((n, idx) => (
                <ClueText key={`${row}-${idx}`} value={n} size={cellSize} />
              ))}
            </View>
          ))}
        </View>

        <GestureDetector gesture={panGesture}>
          <View>
            {Array.from({ length: rows }, (_, row) => (
              <View key={`row-${row}`} className="flex-row">
                {Array.from({ length: cols }, (_, col) => {
                  const value = playState[row]![col]!;
                  const isSelected =
                    selected?.row === row && selected?.col === col;
                  const highlightRow = selected?.row === row;
                  const highlightCol = selected?.col === col;
                  const backgroundColor = cellBackground(
                    value,
                    isSelected,
                    highlightRow,
                    highlightCol,
                  );

                  return (
                    <Pressable
                      key={`${row}-${col}`}
                      accessibilityRole="button"
                      accessibilityLabel={cellA11yLabel(
                        grid,
                        row,
                        col,
                        value,
                      )}
                      onPress={() => {
                        if (suppressPressRef.current) {
                          suppressPressRef.current = false;
                          return;
                        }
                        onPressCell(row, col);
                      }}
                      onLongPress={() => onLongPressCell(row, col)}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderWidth: 0.5,
                        borderColor: colors.hairline,
                        backgroundColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {value === NONOGRAM_CROSS ? (
                        <Text
                          style={{
                            color: colors.muted,
                            fontSize: cellSize * 0.55,
                            lineHeight: cellSize * 0.6,
                          }}
                        >
                          ×
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </GestureDetector>
      </View>
    </View>
  );
}
