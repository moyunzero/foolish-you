import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';
import type { CellCoord } from '../../lib/puzzles/sudoku/grid';
import { getCellHighlightKind } from '../../lib/puzzles/sudoku/highlights';
import { getDisplayValue } from '../../lib/puzzles/sudoku/display';
import { useI18n } from '../../lib/i18n';
import type { Strings } from '../../lib/i18n/types';
import type { SudokuGivens, SudokuPlayState } from '../../lib/puzzles/types';

const SUDOKU_CELL_LINE = 1;
const SUDOKU_BOX_LINE = 2;
const SUDOKU_OUTER_LINE = 2.5;

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
  const isBoxEdgeRight = col % 3 === 2;
  const isBoxEdgeBottom = row % 3 === 2;
  const rightWidth =
    col === 8 ? 0 : isBoxEdgeRight ? SUDOKU_BOX_LINE : SUDOKU_CELL_LINE;
  const bottomWidth =
    row === 8 ? 0 : isBoxEdgeBottom ? SUDOKU_BOX_LINE : SUDOKU_CELL_LINE;

  return {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: rightWidth,
    borderBottomWidth: bottomWidth,
    ...(rightWidth > 0
      ? {
          borderRightColor: isBoxEdgeRight
            ? colors.sudokuBoxLine
            : colors.sudokuCellLine,
        }
      : null),
    ...(bottomWidth > 0
      ? {
          borderBottomColor: isBoxEdgeBottom
            ? colors.sudokuBoxLine
            : colors.sudokuCellLine,
        }
      : null),
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
  grid: Strings['ui']['grid'],
  row: number,
  col: number,
  value: number,
  given: boolean,
  conflict: boolean,
): string {
  const pos = grid.rowCol(row, col);
  if (value === 0) return `${pos}${grid.empty}`;
  const prefix = given ? grid.knownGiven : grid.filledCell;
  const hint = conflict ? grid.conflictSudoku : '';
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
  const { strings } = useI18n();
  const grid = strings.ui.grid;

  return (
    <View
      className="aspect-square w-full overflow-hidden rounded-md"
      style={{
        borderWidth: SUDOKU_OUTER_LINE,
        borderColor: colors.sudokuOuterLine,
        backgroundColor: colors.canvasSoft,
      }}
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
                  grid,
                  row,
                  col,
                  value,
                  given,
                  conflict,
                )}
                accessibilityState={{ selected: isSelectedCell }}
                accessibilityHint={
                  given
                    ? grid.sudokuGivenA11y
                    : conflict
                      ? grid.sudokuConflictA11y
                      : grid.sudokuCellA11y
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
                        borderColor: given ? colors.sudokuGiven : colors.ink,
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
