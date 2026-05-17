import type { CellCoord } from './grid';
import type { SudokuGivens, SudokuPlayState } from '../types';
import { mergePlayAndGivens } from './grid';

export function getDisplayValue(
  givens: SudokuGivens,
  play: SudokuPlayState,
  row: number,
  col: number,
): number {
  const given = givens[row][col];
  if (given !== 0) return given;
  return play[row][col] ?? 0;
}

/**
 * 选中格所在行、列、3×3 宫内已出现的数字（用于数字条置灰提示）。
 */
export function getDigitsUsedInUnit(
  givens: SudokuGivens,
  play: SudokuPlayState,
  cell: CellCoord,
): Set<number> {
  const used = new Set<number>();
  const { row, col } = cell;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  const mark = (r: number, c: number) => {
    const value = getDisplayValue(givens, play, r, c);
    if (value !== 0) used.add(value);
  };

  for (let c = 0; c < 9; c += 1) mark(row, c);
  for (let r = 0; r < 9; r += 1) mark(r, col);
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      mark(r, c);
    }
  }

  return used;
}

/** 盘面上某数字已出现 9 次 → 数字条可置灰（全盘统计，备用） */
export function getFilledDigits(
  givens: SudokuGivens,
  play: SudokuPlayState,
): Set<number> {
  const merged = mergePlayAndGivens(givens, play);
  const counts = new Array<number>(10).fill(0);

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = merged[row][col];
      if (value !== 0) counts[value] += 1;
    }
  }

  const filled = new Set<number>();
  for (let digit = 1; digit <= 9; digit += 1) {
    if (counts[digit] >= 9) filled.add(digit);
  }
  return filled;
}
