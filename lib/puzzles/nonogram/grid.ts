import {
  NONOGRAM_COLS,
  NONOGRAM_EMPTY,
  NONOGRAM_ROWS,
  type NonogramCell,
} from './spec';

export type CellCoord = { row: number; col: number };

export function createEmptyGrid(
  rows = NONOGRAM_ROWS,
  cols = NONOGRAM_COLS,
): NonogramCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => NONOGRAM_EMPTY),
  );
}

export function cloneGrid(grid: NonogramCell[][]): NonogramCell[][] {
  return grid.map((row) => [...row]);
}

export function parsePatternRows(rows: string[]): boolean[][] {
  return rows.map((line) => line.split('').map((ch) => ch === '1'));
}
