export const SUDOKU_SIZE = 9;
export const SUDOKU_BOX = 3;

export type CellCoord = { row: number; col: number };

export function createEmptyGrid(): number[][] {
  return Array.from({ length: SUDOKU_SIZE }, () =>
    Array(SUDOKU_SIZE).fill(0),
  );
}

export function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

export function countGivens(grid: number[][]): number {
  let count = 0;
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    for (let c = 0; c < SUDOKU_SIZE; c += 1) {
      if (grid[r][c] !== 0) count += 1;
    }
  }
  return count;
}

/** 已知数优先，否则取用户填入 */
export function mergePlayAndGivens(
  givens: number[][],
  play: number[][],
): number[][] {
  return givens.map((row, r) =>
    row.map((value, c) => {
      if (value !== 0) return value;
      return play[r]?.[c] ?? 0;
    }),
  );
}

export function shuffleIndices(
  length: number,
  rng: () => number,
): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function indexToCoord(index: number): CellCoord {
  return { row: Math.floor(index / SUDOKU_SIZE), col: index % SUDOKU_SIZE };
}
