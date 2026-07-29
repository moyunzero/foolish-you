import { cloneGrid, SUDOKU_BOX, SUDOKU_SIZE } from './grid';

/** Bits 0..8 → digits 1..9. */
export const ALL_CANDIDATES = 0x1ff;

export type CandidateGrid = Uint16Array;

export function digitBit(digit: number): number {
  return 1 << (digit - 1);
}

export function hasDigit(mask: number, digit: number): boolean {
  return (mask & digitBit(digit)) !== 0;
}

export function cellIndex(row: number, col: number): number {
  return row * SUDOKU_SIZE + col;
}

export function countBits(mask: number): number {
  let n = 0;
  let m = mask;
  while (m !== 0) {
    n += 1;
    m &= m - 1;
  }
  return n;
}

export function firstDigit(mask: number): number {
  for (let d = 1; d <= 9; d += 1) {
    if (hasDigit(mask, d)) return d;
  }
  return 0;
}

export function digitsFromMask(mask: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9; d += 1) {
    if (hasDigit(mask, d)) out.push(d);
  }
  return out;
}

function eliminateFromPeers(
  candidates: CandidateGrid,
  row: number,
  col: number,
  digit: number,
): void {
  const bit = digitBit(digit);
  for (let c = 0; c < SUDOKU_SIZE; c += 1) {
    if (c === col) continue;
    candidates[cellIndex(row, c)] &= ~bit;
  }
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    if (r === row) continue;
    candidates[cellIndex(r, col)] &= ~bit;
  }
  const boxRow = Math.floor(row / SUDOKU_BOX) * SUDOKU_BOX;
  const boxCol = Math.floor(col / SUDOKU_BOX) * SUDOKU_BOX;
  for (let r = boxRow; r < boxRow + SUDOKU_BOX; r += 1) {
    for (let c = boxCol; c < boxCol + SUDOKU_BOX; c += 1) {
      if (r === row && c === col) continue;
      candidates[cellIndex(r, c)] &= ~bit;
    }
  }
}

/**
 * Place digit in working candidates: clear cell mask and eliminate from peers.
 * Does not mutate caller givens — only the CandidateGrid.
 */
export function placeDigit(
  candidates: CandidateGrid,
  index: number,
  digit: number,
): void {
  candidates[index] = 0;
  const row = Math.floor(index / SUDOKU_SIZE);
  const col = index % SUDOKU_SIZE;
  eliminateFromPeers(candidates, row, col, digit);
}

/** Build pencil marks from givens; clones nothing of givens beyond reading. */
export function initCandidates(givens: number[][]): CandidateGrid {
  const candidates = new Uint16Array(SUDOKU_SIZE * SUDOKU_SIZE);
  candidates.fill(ALL_CANDIDATES);
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    for (let c = 0; c < SUDOKU_SIZE; c += 1) {
      const v = givens[r]?.[c] ?? 0;
      if (v !== 0) {
        placeDigit(candidates, cellIndex(r, c), v);
      }
    }
  }
  return candidates;
}

export function cloneCandidates(candidates: CandidateGrid): CandidateGrid {
  return new Uint16Array(candidates);
}

/** Working digit board + candidates for technique detectors. */
export type TechniqueBoard = {
  digits: number[][];
  candidates: CandidateGrid;
};

export function initTechniqueBoard(givens: number[][]): TechniqueBoard {
  return {
    digits: cloneGrid(givens),
    candidates: initCandidates(givens),
  };
}

export function placeOnBoard(
  board: TechniqueBoard,
  row: number,
  col: number,
  digit: number,
): void {
  board.digits[row][col] = digit;
  placeDigit(board.candidates, cellIndex(row, col), digit);
}

export function eliminateCandidate(
  board: TechniqueBoard,
  row: number,
  col: number,
  digit: number,
): boolean {
  const idx = cellIndex(row, col);
  const bit = digitBit(digit);
  if ((board.candidates[idx] & bit) === 0) return false;
  board.candidates[idx] &= ~bit;
  return true;
}
