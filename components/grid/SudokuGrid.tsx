import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';
import type { CellCoord } from '../../lib/puzzles/sudoku/grid';
import { getCellHighlightKind } from '../../lib/puzzles/sudoku/highlights';
import { getDisplayValue } from '../../lib/puzzles/sudoku/display';
import type { SudokuGivens, SudokuPlayState } from '../../lib/puzzles/types';

type SudokuGridProps = {
  givens: SudokuGivens;
  playState: SudokuPlayState;
  selected: CellCoord | null;
  conflictCells: CellCoord[];
  onSelectCell: (row: number, col: number) => void;
  onLongPressCell: (row: number, col: number) => void;
};

function isConflict(
  conflictCells: CellCoord[],
  row: number,
  col: number,
): boolean {
  return conflictCells.some((c) => c.row === row && c.col === col);
}

function cellBorderStyle(row: number, col: number) {
  const borderColor = colors.hairline;
  return {
    borderColor,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: col % 3 === 2 && col < 8 ? 1.5 : 1,
    borderBottomWidth: row % 3 === 2 && row < 8 ? 1.5 : 1,
  } as const;
}

function highlightBackground(
  kind: ReturnType<typeof getCellHighlightKind>,
  conflict: boolean,
): string | undefined {
  if (conflict) return 'rgba(248, 113, 113, 0.22)';
  switch (kind) {
    case 'selected':
      return 'rgba(255, 255, 255, 0.14)';
    case 'sameDigit':
      return 'rgba(255, 122, 23, 0.2)';
    case 'peer':
      return 'rgba(255, 255, 255, 0.06)';
    default:
      return undefined;
  }
}

function cellA11yLabel(
  row: number,
  col: number,
  value: number,
  given: boolean,
  conflict: boolean,
): string {
  const pos = `第 ${row + 1} 行第 ${col + 1} 列`;
  if (value === 0) return `${pos}，空`;
  const prefix = given ? '已知数' : '已填';
  const hint = conflict ? '，与同行列或同宫冲突' : '';
  return `${pos}，${prefix} ${value}${hint}`;
}

export default function SudokuGrid({
  givens,
  playState,
  selected,
  conflictCells,
  onSelectCell,
  onLongPressCell,
}: SudokuGridProps) {
  return (
    <View
      className="aspect-square w-full overflow-hidden rounded-md"
      style={{ borderWidth: 1.5, borderColor: colors.hairline }}
    >
      {Array.from({ length: 9 }, (_, row) => (
        <View key={`row-${row}`} className="flex-1 flex-row">
          {Array.from({ length: 9 }, (_, col) => {
            const given = givens[row][col] !== 0;
            const value = getDisplayValue(givens, playState, row, col);
            const conflict = isConflict(conflictCells, row, col);
            const highlight = getCellHighlightKind(
              row,
              col,
              selected,
              givens,
              playState,
            );
            const isSelectedCell = highlight === 'selected';
            const bg = highlightBackground(highlight, conflict);

            return (
              <Pressable
                key={`cell-${row}-${col}`}
                accessibilityRole="button"
                accessibilityLabel={cellA11yLabel(
                  row,
                  col,
                  value,
                  given,
                  conflict,
                )}
                accessibilityState={{ selected: isSelectedCell }}
                accessibilityHint={
                  given
                    ? '题目给定数字，不可修改'
                    : conflict
                      ? '与同行、同列或同宫有重复数字'
                      : '点按选中，长按清空'
                }
                onPress={() => onSelectCell(row, col)}
                onLongPress={() => onLongPressCell(row, col)}
                delayLongPress={400}
                style={[
                  {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bg,
                  },
                  cellBorderStyle(row, col),
                  isSelectedCell
                    ? {
                        borderWidth: 2,
                        borderColor: colors.ink,
                        zIndex: 2,
                      }
                    : null,
                  conflict && !isSelectedCell
                    ? { borderColor: colors.sudokuError }
                    : null,
                ]}
              >
                {value !== 0 ? (
                  <Text
                    style={{
                      fontFamily: 'SpaceMono_400Regular',
                      fontSize: given ? 17 : 20,
                      color: conflict
                        ? colors.sudokuError
                        : given
                          ? colors.sudokuGiven
                          : colors.ink,
                    }}
                  >
                    {String(value)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
