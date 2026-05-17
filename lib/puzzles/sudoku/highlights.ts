import type { CellCoord } from './grid';
import type { SudokuGivens, SudokuPlayState } from '../types';
import { getDisplayValue } from './display';

export type CellHighlightKind =
  | 'none'
  | 'peer'
  | 'sameDigit'
  | 'selected';

function sameBox(a: CellCoord, b: CellCoord): boolean {
  return (
    Math.floor(a.row / 3) === Math.floor(b.row / 3) &&
    Math.floor(a.col / 3) === Math.floor(b.col / 3)
  );
}

export function getCellHighlightKind(
  row: number,
  col: number,
  selected: CellCoord | null,
  givens: SudokuGivens,
  play: SudokuPlayState,
): CellHighlightKind {
  if (selected == null) return 'none';

  const cell: CellCoord = { row, col };
  if (cell.row === selected.row && cell.col === selected.col) {
    return 'selected';
  }

  const selectedValue = getDisplayValue(
    givens,
    play,
    selected.row,
    selected.col,
  );
  const cellValue = getDisplayValue(givens, play, row, col);

  if (selectedValue !== 0 && cellValue === selectedValue) {
    return 'sameDigit';
  }

  if (
    cell.row === selected.row ||
    cell.col === selected.col ||
    sameBox(cell, selected)
  ) {
    return 'peer';
  }

  return 'none';
}
