import {
  BINARY_EMPTY,
  BINARY_ONE,
  BINARY_ZERO,
} from './grid';
import { BINARY_HALF, BINARY_SIZE } from './spec';
import type { BinaryTechnique } from './techniqueIds';

export type TechniqueHit = {
  applied: true;
  technique: BinaryTechnique;
};

export type TechniqueMiss = { applied: false };

export type TechniqueResult = TechniqueHit | TechniqueMiss;

const MISS: TechniqueMiss = { applied: false };

function opposite(value: number): number {
  return value === BINARY_ZERO ? BINARY_ONE : BINARY_ZERO;
}

function isFilled(value: number): boolean {
  return value === BINARY_ZERO || value === BINARY_ONE;
}

function getLine(
  grid: number[][],
  orient: 'row' | 'col',
  index: number,
): number[] {
  if (orient === 'row') return grid[index]!;
  return Array.from({ length: BINARY_SIZE }, (_, r) => grid[r]![index]!);
}

function setLineCell(
  grid: number[][],
  orient: 'row' | 'col',
  index: number,
  pos: number,
  value: number,
): void {
  if (orient === 'row') {
    grid[index]![pos] = value;
  } else {
    grid[pos]![index] = value;
  }
}

/** Easy: XX? / ?XX — flank opposite of adjacent pair. */
function tryAdjacentPair(grid: number[][]): TechniqueResult {
  for (const orient of ['row', 'col'] as const) {
    for (let i = 0; i < BINARY_SIZE; i += 1) {
      const line = getLine(grid, orient, i);
      for (let p = 0; p < BINARY_SIZE - 1; p += 1) {
        const a = line[p]!;
        const b = line[p + 1]!;
        if (!isFilled(a) || a !== b) continue;
        const opp = opposite(a);
        if (p + 2 < BINARY_SIZE && line[p + 2] === BINARY_EMPTY) {
          setLineCell(grid, orient, i, p + 2, opp);
          return { applied: true, technique: 'adjacent_pair' };
        }
        if (p - 1 >= 0 && line[p - 1] === BINARY_EMPTY) {
          setLineCell(grid, orient, i, p - 1, opp);
          return { applied: true, technique: 'adjacent_pair' };
        }
      }
    }
  }
  return MISS;
}

/** Easy: X_X — middle opposite of sandwich. */
function tryGapFill(grid: number[][]): TechniqueResult {
  for (const orient of ['row', 'col'] as const) {
    for (let i = 0; i < BINARY_SIZE; i += 1) {
      const line = getLine(grid, orient, i);
      for (let p = 0; p < BINARY_SIZE - 2; p += 1) {
        const a = line[p]!;
        const mid = line[p + 1]!;
        const c = line[p + 2]!;
        if (!isFilled(a) || a !== c || mid !== BINARY_EMPTY) continue;
        setLineCell(grid, orient, i, p + 1, opposite(a));
        return { applied: true, technique: 'gap_fill' };
      }
    }
  }
  return MISS;
}

/** Medium: line hit N/2 of one digit → fill remaining empties with the other. */
function tryBalance(grid: number[][]): TechniqueResult {
  for (const orient of ['row', 'col'] as const) {
    for (let i = 0; i < BINARY_SIZE; i += 1) {
      const line = getLine(grid, orient, i);
      let zeros = 0;
      let ones = 0;
      const empties: number[] = [];
      for (let p = 0; p < BINARY_SIZE; p += 1) {
        const v = line[p]!;
        if (v === BINARY_ZERO) zeros += 1;
        else if (v === BINARY_ONE) ones += 1;
        else empties.push(p);
      }
      if (empties.length === 0) continue;
      let fill: number | null = null;
      if (zeros === BINARY_HALF && ones < BINARY_HALF) fill = BINARY_ONE;
      else if (ones === BINARY_HALF && zeros < BINARY_HALF) fill = BINARY_ZERO;
      if (fill == null) continue;
      // One-hit: place first empty only (SE restart will continue).
      setLineCell(grid, orient, i, empties[0]!, fill);
      return { applied: true, technique: 'balance' };
    }
  }
  return MISS;
}

function linesEqual(a: number[], b: number[]): boolean {
  for (let i = 0; i < BINARY_SIZE; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function lineHasTripleLocal(line: number[]): boolean {
  let run = 1;
  for (let i = 1; i < line.length; i += 1) {
    const cur = line[i]!;
    const prev = line[i - 1]!;
    if (isFilled(cur) && cur === prev) {
      run += 1;
      if (run >= 3) return true;
    } else {
      run = isFilled(cur) ? 1 : 0;
    }
  }
  return false;
}

function lineExceedsBalanceLocal(line: number[]): boolean {
  let zeros = 0;
  let ones = 0;
  for (const v of line) {
    if (v === BINARY_ZERO) zeros += 1;
    else if (v === BINARY_ONE) ones += 1;
  }
  return zeros > BINARY_HALF || ones > BINARY_HALF;
}

/** Enumerate legal completions of a line (≤3 empties); exclude completed duplicates. */
function legalLineCompletions(
  line: number[],
  completed: number[][],
): number[][] {
  const empties: number[] = [];
  for (let p = 0; p < BINARY_SIZE; p += 1) {
    if (line[p] === BINARY_EMPTY) empties.push(p);
  }
  if (empties.length === 0 || empties.length > 3) return [];

  const out: number[][] = [];
  const trial = [...line];

  function rec(k: number): void {
    if (k === empties.length) {
      if (lineHasTripleLocal(trial) || lineExceedsBalanceLocal(trial)) return;
      let zeros = 0;
      let ones = 0;
      for (const v of trial) {
        if (v === BINARY_ZERO) zeros += 1;
        else ones += 1;
      }
      if (zeros !== BINARY_HALF || ones !== BINARY_HALF) return;
      if (completed.some((c) => linesEqual(c, trial))) return;
      out.push([...trial]);
      return;
    }
    const pos = empties[k]!;
    for (const v of [BINARY_ZERO, BINARY_ONE]) {
      trial[pos] = v;
      if (!lineHasTripleLocal(trial) && !lineExceedsBalanceLocal(trial)) {
        rec(k + 1);
      }
      trial[pos] = BINARY_EMPTY;
    }
  }

  rec(0);
  return out;
}

/**
 * Hard: near-duplicate / line-uniqueness forces a digit.
 * Only when at least one completed line exists and excluding duplicate
 * completions removes options (true uniqueness — not bare line_mask).
 */
function tryUniqueness(grid: number[][]): TechniqueResult {
  for (const orient of ['row', 'col'] as const) {
    const lines = Array.from({ length: BINARY_SIZE }, (_, i) =>
      getLine(grid, orient, i),
    );
    const completed = lines.filter((line) => line.every(isFilled));
    if (completed.length === 0) continue;

    for (let i = 0; i < BINARY_SIZE; i += 1) {
      const line = lines[i]!;
      if (line.every(isFilled)) continue;

      const unrestricted = legalLineCompletions(line, []);
      const restricted = legalLineCompletions(line, completed);
      if (restricted.length === 0) continue;
      // Require uniqueness filter to eliminate at least one completion.
      if (unrestricted.length <= restricted.length) continue;

      for (let p = 0; p < BINARY_SIZE; p += 1) {
        if (line[p] !== BINARY_EMPTY) continue;
        const first = restricted[0]![p]!;
        if (restricted.every((c) => c[p] === first)) {
          setLineCell(grid, orient, i, p, first);
          return { applied: true, technique: 'uniqueness' };
        }
      }
    }
  }
  return MISS;
}

/** Easy–Hard detectors only — look_ahead lives in lookAhead.ts. */
const DETECTORS: Array<(grid: number[][]) => TechniqueResult> = [
  tryAdjacentPair,
  tryGapFill,
  tryBalance,
  tryUniqueness,
];

export function applyNextTechnique(grid: number[][]): TechniqueResult {
  for (const detect of DETECTORS) {
    const hit = detect(grid);
    if (hit.applied) return hit;
  }
  return MISS;
}

export function isGridFull(grid: number[][]): boolean {
  for (let r = 0; r < BINARY_SIZE; r += 1) {
    for (let c = 0; c < BINARY_SIZE; c += 1) {
      if (grid[r]![c] === BINARY_EMPTY) return false;
    }
  }
  return true;
}

export function clonePlayGrid(givens: number[][]): number[][] {
  return givens.map((row) => [...row]);
}
