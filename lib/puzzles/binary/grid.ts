import { BINARY_SIZE } from './spec';

export type CellCoord = { row: number; col: number };

/** 0=空，1=格内 0，2=格内 1 */
export const BINARY_EMPTY = 0;
export const BINARY_ZERO = 1;
export const BINARY_ONE = 2;

export function createEmptyGrid(): number[][] {
  return Array.from({ length: BINARY_SIZE }, () =>
    Array(BINARY_SIZE).fill(BINARY_EMPTY),
  );
}

export function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

export function countGivens(grid: number[][]): number {
  let count = 0;
  for (let r = 0; r < BINARY_SIZE; r += 1) {
    for (let c = 0; c < BINARY_SIZE; c += 1) {
      if (grid[r][c] !== BINARY_EMPTY) count += 1;
    }
  }
  return count;
}

export function mergePlayAndGivens(
  givens: number[][],
  play: number[][],
): number[][] {
  return givens.map((row, r) =>
    row.map((value, c) => {
      if (value !== BINARY_EMPTY) return value;
      return play[r]?.[c] ?? BINARY_EMPTY;
    }),
  );
}

export function shuffleIndices(length: number, rng: () => number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function indexToCoord(index: number): CellCoord {
  return { row: Math.floor(index / BINARY_SIZE), col: index % BINARY_SIZE };
}

export function displayChar(value: number): string {
  if (value === BINARY_ZERO) return '0';
  if (value === BINARY_ONE) return '1';
  return '';
}
