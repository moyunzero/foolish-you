import { cloneGrid, createEmptyGrid } from './grid';
import { settleLine } from './lineSolver';
import {
  NONOGRAM_COLS,
  NONOGRAM_EMPTY,
  NONOGRAM_ROWS,
  type NonogramCell,
} from './spec';

export function clonePlayGrid(grid: NonogramCell[][]): NonogramCell[][] {
  return cloneGrid(grid);
}

export function isGridFull(grid: NonogramCell[][]): boolean {
  for (let r = 0; r < grid.length; r += 1) {
    const row = grid[r]!;
    for (let c = 0; c < row.length; c += 1) {
      if (row[c] === NONOGRAM_EMPTY) return false;
    }
  }
  return true;
}

function applyLine(
  grid: NonogramCell[][],
  lineIndex: number,
  orientation: 'h' | 'v',
  settled: NonogramCell[],
): boolean {
  let changed = false;
  if (orientation === 'h') {
    const row = grid[lineIndex]!;
    for (let c = 0; c < settled.length; c += 1) {
      if (row[c] !== settled[c]) {
        row[c] = settled[c]!;
        changed = true;
      }
    }
  } else {
    for (let r = 0; r < settled.length; r += 1) {
      if (grid[r]![lineIndex] !== settled[r]) {
        grid[r]![lineIndex] = settled[r]!;
        changed = true;
      }
    }
  }
  return changed;
}

function readCol(grid: NonogramCell[][], col: number): NonogramCell[] {
  return grid.map((row) => row[col]!);
}

export type FullSettleResult = {
  sweepCount: number;
  solved: boolean;
  stuck: boolean;
  /** Mutated play grid after sweeps (same reference as input when in-place). */
  grid: NonogramCell[][];
};

/**
 * FullSettle: alternate H-SWEEP (all rows) then V-SWEEP (all columns), H-first.
 * Each H or V sweep op increments sweepCount (Kosters primary).
 * Mutates `grid` in place; clone before calling when needed.
 */
export function fullSettle(
  grid: NonogramCell[][],
  rowClues: number[][],
  colClues: number[][],
): FullSettleResult {
  let sweepCount = 0;

  // Safety: n=8 FullSettle should converge quickly; cap prevents infinite loops.
  const maxRounds = NONOGRAM_ROWS * NONOGRAM_COLS * 4;

  for (let round = 0; round < maxRounds; round += 1) {
    let roundChanged = false;

    // H-SWEEP
    sweepCount += 1;
    let hChanged = false;
    for (let r = 0; r < NONOGRAM_ROWS; r += 1) {
      const settled = settleLine(grid[r]!, rowClues[r]!);
      if (applyLine(grid, r, 'h', settled)) hChanged = true;
    }
    roundChanged = roundChanged || hChanged;
    if (isGridFull(grid)) {
      return { sweepCount, solved: true, stuck: false, grid };
    }

    // V-SWEEP
    sweepCount += 1;
    let vChanged = false;
    for (let c = 0; c < NONOGRAM_COLS; c += 1) {
      const settled = settleLine(readCol(grid, c), colClues[c]!);
      if (applyLine(grid, c, 'v', settled)) vChanged = true;
    }
    roundChanged = roundChanged || vChanged;
    if (isGridFull(grid)) {
      return { sweepCount, solved: true, stuck: false, grid };
    }

    if (!roundChanged) {
      return { sweepCount, solved: false, stuck: true, grid };
    }
  }

  return {
    sweepCount,
    solved: isGridFull(grid),
    stuck: !isGridFull(grid),
    grid,
  };
}

/** Fresh empty 8×8 then FullSettle from clues alone. */
export function fullSettleFromClues(
  rowClues: number[][],
  colClues: number[][],
): FullSettleResult {
  const grid = createEmptyGrid();
  return fullSettle(grid, rowClues, colClues);
}
