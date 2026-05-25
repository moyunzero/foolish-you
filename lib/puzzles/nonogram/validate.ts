import { cloneGrid } from './grid';
import {
  NONOGRAM_CROSS,
  NONOGRAM_EMPTY,
  NONOGRAM_FILL,
  type NonogramCell,
} from './spec';

export function isCompleteAndValid(
  playState: NonogramCell[][],
  solution: boolean[][],
): boolean {
  const rows = solution.length;
  const cols = solution[0]?.length ?? 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const shouldFill = solution[row]![col]!;
      const cell = playState[row]![col]!;
      if (shouldFill && cell !== NONOGRAM_FILL) return false;
      if (!shouldFill && cell === NONOGRAM_FILL) return false;
    }
  }
  return true;
}

export function cycleCellValue(value: NonogramCell): NonogramCell {
  if (value === NONOGRAM_EMPTY) return NONOGRAM_FILL;
  if (value === NONOGRAM_FILL) return NONOGRAM_CROSS;
  return NONOGRAM_EMPTY;
}

export function clearCell(playState: NonogramCell[][], row: number, col: number): NonogramCell[][] {
  const next = cloneGrid(playState);
  next[row]![col] = NONOGRAM_EMPTY;
  return next;
}
