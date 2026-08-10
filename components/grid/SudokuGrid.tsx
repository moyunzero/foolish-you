import { Pressable, Text, View } from 'react-native';

import { colors } from '../../constants/design';
import type { CellCoord } from '../../lib/puzzles/sudoku/grid';
import { getCellHighlightKind } from '../../lib/puzzles/sudoku/highlights';
import { getDisplayValue } from '../../lib/puzzles/sudoku/display';
import { noteHasDigit } from '../../lib/puzzles/sudoku/notes';
import { useI18n } from '../../lib/i18n';
import type { Strings } from '../../lib/i18n/types';
import type {
  SudokuGivens,
  SudokuNotes,
  SudokuPlayState,
} from '../../lib/puzzles/types';

const SUDOKU_CELL_LINE = 1;
const SUDOKU_BOX_LINE = 2;
const SUDOKU_OUTER_LINE = 2.5;
const NOTE_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type SudokuGridProps = {
  givens: SudokuGivens;
  playState: SudokuPlayState;
  sudokuNotes?: SudokuNotes;
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
  notesMask: number,
): string {
  const pos = grid.rowCol(row, col);
  if (value === 0) {
    if (notesMask !== 0) {
      const digits = NOTE_DIGITS.filter((d) => noteHasDigit(notesMask, d));
      return `${pos}${grid.notesCell(digits.join(''))}`;
    }
    return `${pos}${grid.empty}`;
  }
  const prefix = given ? grid.knownGiven : grid.filledCell;
  const hint = conflict ? grid.conflictSudoku : '';
  return `${pos}，${prefix} ${value}${hint}`;
}

function NotesGlyph({ mask }: { mask: number }) {
  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'center',
        padding: 1,
      }}
    >
      {NOTE_DIGITS.map((digit) => (
        <Text
          key={digit}
          style={{
            width: '33.33%',
            textAlign: 'center',
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 8,
            lineHeight: 10,
            color: colors.muted,
            opacity: noteHasDigit(mask, digit) ? 1 : 0,
          }}
        >
          {String(digit)}
        </Text>
      ))}
    </View>
  );
}

export default function SudokuGrid({
  givens,
  playState,
  sudokuNotes,
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
            const notesMask = sudokuNotes?.[row]?.[col] ?? 0;
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
                  notesMask,
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
                ) : notesMask !== 0 ? (
                  <NotesGlyph mask={notesMask} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
