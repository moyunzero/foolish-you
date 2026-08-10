import { useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { colors } from '../../constants/design';
import {
  BINARY_EMPTY,
  BINARY_ZERO,
  displayChar,
  type CellCoord,
} from '../../lib/puzzles/binary/grid';
import { BINARY_SIZE } from '../../lib/puzzles/binary/spec';
import { mergePlayAndGivens } from '../../lib/puzzles/binary/grid';
import { useI18n } from '../../lib/i18n';
import type { Strings } from '../../lib/i18n/types';
import type { BinaryGivens, BinaryPlayState } from '../../lib/puzzles/types';

type BinaryGridProps = {
  givens: BinaryGivens;
  playState: BinaryPlayState;
  selected: CellCoord | null;
  conflictCells: CellCoord[];
  onPressCell: (row: number, col: number) => void;
  onLongPressCell: (row: number, col: number) => void;
  onDragStrokeBegin: (row: number, col: number) => void;
  onDragStrokeMove: (row: number, col: number) => void;
  onDragStrokeEnd: () => void;
};

function isConflict(
  conflictCells: CellCoord[],
  row: number,
  col: number,
): boolean {
  return conflictCells.some((c) => c.row === row && c.col === col);
}

function isGiven(givens: BinaryGivens, row: number, col: number): boolean {
  return givens[row][col] !== BINARY_EMPTY;
}

function highlightBackground(
  selected: CellCoord | null,
  merged: number[][],
  row: number,
  col: number,
  conflict: boolean,
): string | undefined {
  if (conflict) return 'rgba(248, 113, 113, 0.22)';
  if (selected?.row === row && selected?.col === col) {
    return 'rgba(255, 255, 255, 0.14)';
  }
  if (selected != null) {
    const selectedValue = merged[selected.row]![selected.col]!;
    const cellValue = merged[row]![col]!;
    if (selectedValue !== BINARY_EMPTY && cellValue === selectedValue) {
      return 'rgba(255, 122, 23, 0.2)';
    }
    if (selected.row === row || selected.col === col) {
      return 'rgba(255, 255, 255, 0.06)';
    }
  }
  return undefined;
}

function cellA11yLabel(
  grid: Strings['ui']['grid'],
  row: number,
  col: number,
  value: number,
  given: boolean,
  conflict: boolean,
): string {
  const pos = grid.rowCol(row, col);
  if (value === BINARY_EMPTY) return `${pos}${grid.empty}`;
  const label = value === BINARY_ZERO ? '0' : '1';
  const prefix = given ? grid.given : grid.filledCell;
  const hint = conflict ? grid.conflictBinary : '';
  return `${pos}，${prefix} ${label}${hint}`;
}

export default function BinaryGrid({
  givens,
  playState,
  selected,
  conflictCells,
  onPressCell,
  onLongPressCell,
  onDragStrokeBegin,
  onDragStrokeMove,
  onDragStrokeEnd,
}: BinaryGridProps) {
  const { strings } = useI18n();
  const grid = strings.ui.grid;
  const merged = mergePlayAndGivens(givens, playState);
  const layoutRef = useRef({ width: 0, height: 0 });
  const suppressPressRef = useRef(false);

  const cellFromXY = (x: number, y: number): CellCoord | null => {
    const { width, height } = layoutRef.current;
    if (width <= 0 || height <= 0) return null;
    const col = Math.floor(x / (width / BINARY_SIZE));
    const row = Math.floor(y / (height / BINARY_SIZE));
    if (row < 0 || col < 0 || row >= BINARY_SIZE || col >= BINARY_SIZE) {
      return null;
    }
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
    [onDragStrokeBegin, onDragStrokeMove, onDragStrokeEnd],
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View
        className="aspect-square w-full overflow-hidden rounded-md"
        style={{ borderWidth: 1.5, borderColor: colors.hairline }}
        onLayout={(e) => {
          layoutRef.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
      >
        {Array.from({ length: BINARY_SIZE }, (_, row) => (
          <View key={`row-${row}`} className="flex-1 flex-row">
            {Array.from({ length: BINARY_SIZE }, (_, col) => {
              const given = isGiven(givens, row, col);
              const value = merged[row][col];
              const conflict = isConflict(conflictCells, row, col);
              const isSelectedCell =
                selected?.row === row && selected?.col === col;
              const bg = highlightBackground(
                selected,
                merged,
                row,
                col,
                conflict,
              );

              return (
                <Pressable
                  key={`cell-${row}-${col}`}
                  accessibilityRole="button"
                  accessibilityLabel={cellA11yLabel(
                    grid,
                    row,
                    col,
                    value,
                    given,
                    conflict,
                  )}
                  onPress={() => {
                    if (suppressPressRef.current) {
                      suppressPressRef.current = false;
                      return;
                    }
                    onPressCell(row, col);
                  }}
                  onLongPress={() => onLongPressCell(row, col)}
                  delayLongPress={400}
                  className="flex-1 items-center justify-center"
                  style={{
                    backgroundColor: bg,
                    borderColor: colors.hairline,
                    borderTopWidth: 1,
                    borderLeftWidth: 1,
                    borderRightWidth: col === BINARY_SIZE - 1 ? 1.5 : 1,
                    borderBottomWidth: row === BINARY_SIZE - 1 ? 1.5 : 1,
                    ...(isSelectedCell
                      ? {
                          borderWidth: 2,
                          borderColor: given ? colors.sudokuGiven : colors.ink,
                          zIndex: 2,
                        }
                      : null),
                  }}
                >
                  <Text
                    style={{
                      fontFamily: given
                        ? 'SpaceMono_400Regular'
                        : 'SpaceMono_700Bold',
                      fontSize: given ? 17 : 20,
                      color: given ? colors.sudokuGiven : colors.ink,
                    }}
                  >
                    {displayChar(value)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </GestureDetector>
  );
}
