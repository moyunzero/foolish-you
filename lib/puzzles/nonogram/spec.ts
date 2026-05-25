/** v1 固定 8×8，与图案库一致 */
export const NONOGRAM_ROWS = 8;
export const NONOGRAM_COLS = 8;

export const NONOGRAM_EMPTY = -1 as const;
export const NONOGRAM_CROSS = 0 as const;
export const NONOGRAM_FILL = 1 as const;

export type NonogramCell =
  | typeof NONOGRAM_EMPTY
  | typeof NONOGRAM_CROSS
  | typeof NONOGRAM_FILL;
