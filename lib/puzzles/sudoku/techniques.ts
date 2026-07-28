import {
  cellIndex,
  countBits,
  digitBit,
  digitsFromMask,
  eliminateCandidate,
  firstDigit,
  hasDigit,
  placeOnBoard,
  type TechniqueBoard,
} from './candidates';
import type { SudokuTechnique } from './techniqueIds';
import { SUDOKU_SIZE } from './grid';

export type TechniqueHit = {
  applied: true;
  technique: SudokuTechnique;
};

export type TechniqueMiss = { applied: false };

export type TechniqueResult = TechniqueHit | TechniqueMiss;

const MISS: TechniqueMiss = { applied: false };

/** Houses 0..8 rows, 9..17 cols, 18..26 boxes — fixed scan order. */
export function houseCellIndices(house: number): number[] {
  if (house < 9) {
    const row = house;
    return Array.from({ length: 9 }, (_, c) => cellIndex(row, c));
  }
  if (house < 18) {
    const col = house - 9;
    return Array.from({ length: 9 }, (_, r) => cellIndex(r, col));
  }
  const box = house - 18;
  const boxRow = Math.floor(box / 3) * 3;
  const boxCol = (box % 3) * 3;
  const cells: number[] = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      cells.push(cellIndex(boxRow + r, boxCol + c));
    }
  }
  return cells;
}

function idxRow(i: number): number {
  return Math.floor(i / SUDOKU_SIZE);
}

function idxCol(i: number): number {
  return i % SUDOKU_SIZE;
}

function emptyCellsInHouse(board: TechniqueBoard, house: number): number[] {
  return houseCellIndices(house).filter((i) => board.digits[idxRow(i)][idxCol(i)] === 0);
}

function tryFullHouse(board: TechniqueBoard): TechniqueResult {
  for (let h = 0; h < 27; h += 1) {
    const empty = emptyCellsInHouse(board, h);
    if (empty.length !== 1) continue;
    const idx = empty[0]!;
    const mask = board.candidates[idx];
    if (countBits(mask) !== 1) continue;
    const digit = firstDigit(mask);
    placeOnBoard(board, idxRow(idx), idxCol(idx), digit);
    return { applied: true, technique: 'full_house' };
  }
  return MISS;
}

function tryNakedSingle(board: TechniqueBoard): TechniqueResult {
  for (let i = 0; i < 81; i += 1) {
    const r = idxRow(i);
    const c = idxCol(i);
    if (board.digits[r][c] !== 0) continue;
    const mask = board.candidates[i];
    if (countBits(mask) !== 1) continue;
    placeOnBoard(board, r, c, firstDigit(mask));
    return { applied: true, technique: 'naked_single' };
  }
  return MISS;
}

function tryHiddenSingle(board: TechniqueBoard): TechniqueResult {
  for (let h = 0; h < 27; h += 1) {
    for (let digit = 1; digit <= 9; digit += 1) {
      const bit = digitBit(digit);
      const spots: number[] = [];
      for (const i of houseCellIndices(h)) {
        if (board.digits[idxRow(i)][idxCol(i)] !== 0) continue;
        if ((board.candidates[i] & bit) !== 0) spots.push(i);
      }
      if (spots.length !== 1) continue;
      const idx = spots[0]!;
      // Prefer hidden_single over re-labeling naked_single when mask has extras
      placeOnBoard(board, idxRow(idx), idxCol(idx), digit);
      return { applied: true, technique: 'hidden_single' };
    }
  }
  return MISS;
}

function tryPointing(board: TechniqueBoard): TechniqueResult {
  // Digit in a box confined to one row/col → eliminate outside box in that line
  for (let box = 0; box < 9; box += 1) {
    const cells = houseCellIndices(18 + box);
    for (let digit = 1; digit <= 9; digit += 1) {
      const bit = digitBit(digit);
      const spots = cells.filter(
        (i) =>
          board.digits[idxRow(i)][idxCol(i)] === 0 &&
          (board.candidates[i] & bit) !== 0,
      );
      if (spots.length < 2) continue;
      const rows = new Set(spots.map(idxRow));
      const cols = new Set(spots.map(idxCol));
      if (rows.size === 1) {
        const row = [...rows][0]!;
        let changed = false;
        for (let c = 0; c < 9; c += 1) {
          const i = cellIndex(row, c);
          if (cells.includes(i)) continue;
          if (eliminateCandidate(board, row, c, digit)) changed = true;
        }
        if (changed) return { applied: true, technique: 'pointing' };
      }
      if (cols.size === 1) {
        const col = [...cols][0]!;
        let changed = false;
        for (let r = 0; r < 9; r += 1) {
          const i = cellIndex(r, col);
          if (cells.includes(i)) continue;
          if (eliminateCandidate(board, r, col, digit)) changed = true;
        }
        if (changed) return { applied: true, technique: 'pointing' };
      }
    }
  }
  return MISS;
}

function tryClaiming(board: TechniqueBoard): TechniqueResult {
  // Digit in a row/col confined to one box → eliminate rest of box
  for (let line = 0; line < 18; line += 1) {
    const cells = houseCellIndices(line);
    for (let digit = 1; digit <= 9; digit += 1) {
      const bit = digitBit(digit);
      const spots = cells.filter(
        (i) =>
          board.digits[idxRow(i)][idxCol(i)] === 0 &&
          (board.candidates[i] & bit) !== 0,
      );
      if (spots.length < 2) continue;
      const boxes = new Set(
        spots.map((i) => Math.floor(idxRow(i) / 3) * 3 + Math.floor(idxCol(i) / 3)),
      );
      if (boxes.size !== 1) continue;
      const box = [...boxes][0]!;
      const boxCells = houseCellIndices(18 + box);
      let changed = false;
      for (const i of boxCells) {
        if (cells.includes(i)) continue;
        if (eliminateCandidate(board, idxRow(i), idxCol(i), digit)) changed = true;
      }
      if (changed) return { applied: true, technique: 'claiming' };
    }
  }
  return MISS;
}

function tryNakedSubset(
  board: TechniqueBoard,
  size: 2 | 3,
  technique: 'naked_pair' | 'naked_triple',
): TechniqueResult {
  for (let h = 0; h < 27; h += 1) {
    const empty = emptyCellsInHouse(board, h);
    if (empty.length < size) continue;
    // Combinations of `size` cells whose union of candidates has size bits
    const n = empty.length;
    const choose = (start: number, picked: number[]): boolean => {
      if (picked.length === size) {
        let union = 0;
        for (const i of picked) union |= board.candidates[i];
        if (countBits(union) !== size) return false;
        // Each picked cell's candidates must be subset of union (always) and
        // for naked subset each cell must only use digits from the union — true by construction.
        // Also require no cell outside has only extras? Standard: eliminate union digits from other cells.
        let changed = false;
        for (const i of empty) {
          if (picked.includes(i)) continue;
          for (const d of digitsFromMask(union)) {
            if (eliminateCandidate(board, idxRow(i), idxCol(i), d)) changed = true;
          }
        }
        return changed;
      }
      for (let k = start; k < n; k += 1) {
        picked.push(empty[k]!);
        if (choose(k + 1, picked)) return true;
        picked.pop();
      }
      return false;
    };
    if (choose(0, [])) return { applied: true, technique };
  }
  return MISS;
}

function tryHiddenSubset(
  board: TechniqueBoard,
  size: 2 | 3,
  technique: 'hidden_pair' | 'hidden_triple',
): TechniqueResult {
  for (let h = 0; h < 27; h += 1) {
    const empty = emptyCellsInHouse(board, h);
    if (empty.length < size) continue;
    // Digits that appear in the house
    const digitSpots: number[][] = Array.from({ length: 10 }, () => []);
    for (const i of empty) {
      for (let d = 1; d <= 9; d += 1) {
        if (hasDigit(board.candidates[i], d)) digitSpots[d]!.push(i);
      }
    }
    const candidateDigits = Array.from({ length: 9 }, (_, k) => k + 1).filter(
      (d) => digitSpots[d]!.length >= 1 && digitSpots[d]!.length <= size,
    );
    const n = candidateDigits.length;
    const choose = (start: number, pickedDigits: number[]): boolean => {
      if (pickedDigits.length === size) {
        const cellSet = new Set<number>();
        for (const d of pickedDigits) {
          for (const i of digitSpots[d]!) cellSet.add(i);
        }
        if (cellSet.size !== size) return false;
        const mask = pickedDigits.reduce((m, d) => m | digitBit(d), 0);
        let changed = false;
        for (const i of cellSet) {
          const before = board.candidates[i];
          const next = before & mask;
          if (next !== before && next !== 0) {
            board.candidates[i] = next;
            changed = true;
          }
        }
        return changed;
      }
      for (let k = start; k < n; k += 1) {
        pickedDigits.push(candidateDigits[k]!);
        if (choose(k + 1, pickedDigits)) return true;
        pickedDigits.pop();
      }
      return false;
    };
    if (choose(0, [])) return { applied: true, technique };
  }
  return MISS;
}

function tryXWing(board: TechniqueBoard): TechniqueResult {
  // For each digit: two rows with candidates in exactly the same two cols
  for (let digit = 1; digit <= 9; digit += 1) {
    const bit = digitBit(digit);
    const rowCols: (number[] | null)[] = Array.from({ length: 9 }, () => null);
    for (let r = 0; r < 9; r += 1) {
      const cols: number[] = [];
      for (let c = 0; c < 9; c += 1) {
        if (board.digits[r][c] !== 0) continue;
        if ((board.candidates[cellIndex(r, c)] & bit) !== 0) cols.push(c);
      }
      if (cols.length === 2) rowCols[r] = cols;
    }
    for (let r1 = 0; r1 < 9; r1 += 1) {
      const a = rowCols[r1];
      if (a == null) continue;
      for (let r2 = r1 + 1; r2 < 9; r2 += 1) {
        const b = rowCols[r2];
        if (b == null) continue;
        if (a[0] !== b[0] || a[1] !== b[1]) continue;
        let changed = false;
        for (const c of a) {
          for (let r = 0; r < 9; r += 1) {
            if (r === r1 || r === r2) continue;
            if (eliminateCandidate(board, r, c, digit)) changed = true;
          }
        }
        if (changed) return { applied: true, technique: 'x_wing' };
      }
    }
    // Column-based X-Wing
    const colRows: (number[] | null)[] = Array.from({ length: 9 }, () => null);
    for (let c = 0; c < 9; c += 1) {
      const rows: number[] = [];
      for (let r = 0; r < 9; r += 1) {
        if (board.digits[r][c] !== 0) continue;
        if ((board.candidates[cellIndex(r, c)] & bit) !== 0) rows.push(r);
      }
      if (rows.length === 2) colRows[c] = rows;
    }
    for (let c1 = 0; c1 < 9; c1 += 1) {
      const a = colRows[c1];
      if (a == null) continue;
      for (let c2 = c1 + 1; c2 < 9; c2 += 1) {
        const b = colRows[c2];
        if (b == null) continue;
        if (a[0] !== b[0] || a[1] !== b[1]) continue;
        let changed = false;
        for (const r of a) {
          for (let c = 0; c < 9; c += 1) {
            if (c === c1 || c === c2) continue;
            if (eliminateCandidate(board, r, c, digit)) changed = true;
          }
        }
        if (changed) return { applied: true, technique: 'x_wing' };
      }
    }
  }
  return MISS;
}

function trySwordfish(board: TechniqueBoard): TechniqueResult {
  for (let digit = 1; digit <= 9; digit += 1) {
    const bit = digitBit(digit);
    const rowCols: (number[] | null)[] = Array.from({ length: 9 }, () => null);
    for (let r = 0; r < 9; r += 1) {
      const cols: number[] = [];
      for (let c = 0; c < 9; c += 1) {
        if (board.digits[r][c] !== 0) continue;
        if ((board.candidates[cellIndex(r, c)] & bit) !== 0) cols.push(c);
      }
      if (cols.length >= 2 && cols.length <= 3) rowCols[r] = cols;
    }
    for (let r1 = 0; r1 < 9; r1 += 1) {
      if (rowCols[r1] == null) continue;
      for (let r2 = r1 + 1; r2 < 9; r2 += 1) {
        if (rowCols[r2] == null) continue;
        for (let r3 = r2 + 1; r3 < 9; r3 += 1) {
          if (rowCols[r3] == null) continue;
          const union = new Set([
            ...rowCols[r1]!,
            ...rowCols[r2]!,
            ...rowCols[r3]!,
          ]);
          if (union.size !== 3) continue;
          let changed = false;
          for (const c of union) {
            for (let r = 0; r < 9; r += 1) {
              if (r === r1 || r === r2 || r === r3) continue;
              if (eliminateCandidate(board, r, c, digit)) changed = true;
            }
          }
          if (changed) return { applied: true, technique: 'swordfish' };
        }
      }
    }
    const colRows: (number[] | null)[] = Array.from({ length: 9 }, () => null);
    for (let c = 0; c < 9; c += 1) {
      const rows: number[] = [];
      for (let r = 0; r < 9; r += 1) {
        if (board.digits[r][c] !== 0) continue;
        if ((board.candidates[cellIndex(r, c)] & bit) !== 0) rows.push(r);
      }
      if (rows.length >= 2 && rows.length <= 3) colRows[c] = rows;
    }
    for (let c1 = 0; c1 < 9; c1 += 1) {
      if (colRows[c1] == null) continue;
      for (let c2 = c1 + 1; c2 < 9; c2 += 1) {
        if (colRows[c2] == null) continue;
        for (let c3 = c2 + 1; c3 < 9; c3 += 1) {
          if (colRows[c3] == null) continue;
          const union = new Set([
            ...colRows[c1]!,
            ...colRows[c2]!,
            ...colRows[c3]!,
          ]);
          if (union.size !== 3) continue;
          let changed = false;
          for (const r of union) {
            for (let c = 0; c < 9; c += 1) {
              if (c === c1 || c === c2 || c === c3) continue;
              if (eliminateCandidate(board, r, c, digit)) changed = true;
            }
          }
          if (changed) return { applied: true, technique: 'swordfish' };
        }
      }
    }
  }
  return MISS;
}

function sameHouse(a: number, b: number): boolean {
  const ra = idxRow(a);
  const ca = idxCol(a);
  const rb = idxRow(b);
  const cb = idxCol(b);
  if (ra === rb || ca === cb) return true;
  return (
    Math.floor(ra / 3) === Math.floor(rb / 3) &&
    Math.floor(ca / 3) === Math.floor(cb / 3)
  );
}

function tryXyWing(board: TechniqueBoard): TechniqueResult {
  // Pivot with two candidates XY; wings XZ and YZ in houses with pivot; eliminate Z from common peers
  const bivalue: number[] = [];
  for (let i = 0; i < 81; i += 1) {
    if (board.digits[idxRow(i)][idxCol(i)] !== 0) continue;
    if (countBits(board.candidates[i]) === 2) bivalue.push(i);
  }
  for (const pivot of bivalue) {
    const [x, y] = digitsFromMask(board.candidates[pivot]);
    if (x == null || y == null) continue;
    for (const w1 of bivalue) {
      if (w1 === pivot || !sameHouse(pivot, w1)) continue;
      const d1 = digitsFromMask(board.candidates[w1]);
      if (d1.length !== 2) continue;
      const hasX = d1.includes(x);
      const hasY = d1.includes(y);
      if (hasX === hasY) continue; // need exactly one of X/Y
      const z1 = d1.find((d) => d !== x && d !== y);
      if (z1 == null) continue;
      const sharedWithPivot = hasX ? x : y;
      const other = sharedWithPivot === x ? y : x;
      for (const w2 of bivalue) {
        if (w2 === pivot || w2 === w1 || !sameHouse(pivot, w2)) continue;
        if (sameHouse(w1, w2) && idxRow(w1) === idxRow(w2) && idxCol(w1) === idxCol(w2))
          continue;
        const d2 = digitsFromMask(board.candidates[w2]);
        if (d2.length !== 2) continue;
        if (!d2.includes(other) || !d2.includes(z1) || d2.includes(sharedWithPivot))
          continue;
        // Eliminate z1 from cells that see both wings
        let changed = false;
        for (let i = 0; i < 81; i += 1) {
          if (i === pivot || i === w1 || i === w2) continue;
          if (board.digits[idxRow(i)][idxCol(i)] !== 0) continue;
          if (!sameHouse(i, w1) || !sameHouse(i, w2)) continue;
          if (eliminateCandidate(board, idxRow(i), idxCol(i), z1)) changed = true;
        }
        if (changed) return { applied: true, technique: 'xy_wing' };
      }
    }
  }
  return MISS;
}

const DETECTORS: Array<(board: TechniqueBoard) => TechniqueResult> = [
  tryFullHouse,
  tryNakedSingle,
  tryHiddenSingle,
  tryPointing,
  tryClaiming,
  (b) => tryNakedSubset(b, 2, 'naked_pair'),
  (b) => tryHiddenSubset(b, 2, 'hidden_pair'),
  (b) => tryNakedSubset(b, 3, 'naked_triple'),
  (b) => tryHiddenSubset(b, 3, 'hidden_triple'),
  tryXWing,
  trySwordfish,
  tryXyWing,
];

/**
 * Apply the first productive Easy→Hard (incl. xy_wing) technique.
 * short_chain is handled in chains.ts by the rater.
 */
export function applyNextTechnique(board: TechniqueBoard): TechniqueResult {
  for (const detect of DETECTORS) {
    const hit = detect(board);
    if (hit.applied) return hit;
  }
  return MISS;
}

export function isGridFull(board: TechniqueBoard): boolean {
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board.digits[r][c] === 0) return false;
    }
  }
  return true;
}
