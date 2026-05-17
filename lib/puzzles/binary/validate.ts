import { BINARY_HALF, BINARY_SIZE } from './spec';
import {
  BINARY_EMPTY,
  BINARY_ONE,
  BINARY_ZERO,
  mergePlayAndGivens,
  type CellCoord,
} from './grid';

function coordKey({ row, col }: CellCoord): string {
  return `${row},${col}`;
}

function isBinaryValue(value: number): boolean {
  return value === BINARY_ZERO || value === BINARY_ONE;
}

function lineHasTriple(line: number[]): boolean {
  let run = 1;
  for (let i = 1; i < line.length; i += 1) {
    const cur = line[i];
    const prev = line[i - 1];
    if (cur !== BINARY_EMPTY && cur === prev) {
      run += 1;
      if (run >= 3) return true;
    } else {
      run = cur === BINARY_EMPTY ? 0 : 1;
    }
  }
  return false;
}

function countLineValues(line: number[]): { zeros: number; ones: number; empty: number } {
  let zeros = 0;
  let ones = 0;
  let empty = 0;
  for (const value of line) {
    if (value === BINARY_ZERO) zeros += 1;
    else if (value === BINARY_ONE) ones += 1;
    else empty += 1;
  }
  return { zeros, ones, empty };
}

function lineExceedsBalance(line: number[]): boolean {
  const { zeros, ones } = countLineValues(line);
  return zeros > BINARY_HALF || ones > BINARY_HALF;
}

function lineIsBalanced(line: number[]): boolean {
  const { zeros, ones, empty } = countLineValues(line);
  return empty === 0 && zeros === BINARY_HALF && ones === BINARY_HALF;
}

function linesAreUnique(lines: number[][]): boolean {
  const full = lines.filter((line) =>
    line.every((value) => isBinaryValue(value)),
  );
  const keys = new Set(full.map((line) => line.join('')));
  return keys.size === full.length;
}

function rowLine(grid: number[][], row: number): number[] {
  return grid[row];
}

function colLine(grid: number[][], col: number): number[] {
  return grid.map((row) => row[col]);
}

export function getViolationCells(grid: number[][]): CellCoord[] {
  const keys = new Set<string>();

  for (let row = 0; row < BINARY_SIZE; row += 1) {
    const line = rowLine(grid, row);
    if (lineHasTriple(line) || lineExceedsBalance(line)) {
      for (let col = 0; col < BINARY_SIZE; col += 1) {
        keys.add(coordKey({ row, col }));
      }
    }
  }

  for (let col = 0; col < BINARY_SIZE; col += 1) {
    const line = colLine(grid, col);
    if (lineHasTriple(line) || lineExceedsBalance(line)) {
      for (let row = 0; row < BINARY_SIZE; row += 1) {
        keys.add(coordKey({ row, col }));
      }
    }
  }

  const rows = grid.map((_, row) => rowLine(grid, row));
  const cols = Array.from({ length: BINARY_SIZE }, (_, col) => colLine(grid, col));
  const allRowsFull = rows.every((line) => lineIsBalanced(line));
  const allColsFull = cols.every((line) => lineIsBalanced(line));

  if (allRowsFull && !linesAreUnique(rows)) {
    for (let row = 0; row < BINARY_SIZE; row += 1) {
      for (let col = 0; col < BINARY_SIZE; col += 1) {
        keys.add(coordKey({ row, col }));
      }
    }
  }

  if (allColsFull && !linesAreUnique(cols)) {
    for (let row = 0; row < BINARY_SIZE; row += 1) {
      for (let col = 0; col < BINARY_SIZE; col += 1) {
        keys.add(coordKey({ row, col }));
      }
    }
  }

  return [...keys].map((key) => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });
}

export function getConflictCells(
  play: number[][],
  givens: number[][],
): CellCoord[] {
  const merged = mergePlayAndGivens(givens, play);
  return getViolationCells(merged);
}

export function isCompleteAndValid(
  play: number[][],
  givens: number[][],
): boolean {
  const merged = mergePlayAndGivens(givens, play);

  for (let row = 0; row < BINARY_SIZE; row += 1) {
    for (let col = 0; col < BINARY_SIZE; col += 1) {
      if (merged[row][col] === BINARY_EMPTY) return false;
    }
  }

  return getViolationCells(merged).length === 0;
}
