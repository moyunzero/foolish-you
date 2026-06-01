import { getConflictCells as getBinaryConflictCells } from '../puzzles/binary/validate';
import { mergePlayAndGivens as mergeBinaryPlay } from '../puzzles/binary/grid';
import { BINARY_SIZE } from '../puzzles/binary/spec';
import { NONOGRAM_EMPTY } from '../puzzles/nonogram/spec';
import { getConflictCells as getSudokuConflictCells } from '../puzzles/sudoku/validate';
import { mergePlayAndGivens as mergeSudokuPlay } from '../puzzles/sudoku/grid';
import { SUDOKU_BOX } from '../puzzles/sudoku/grid';
import { getConflictEdges } from '../puzzles/slitherlink/validate';
import { EDGE_LINE, EDGE_UNKNOWN, SLITHERLINK_SIZE } from '../puzzles/slitherlink/spec';
import type {
  BinaryGivens,
  BinaryPlayState,
  NonogramPlayState,
  SlitherlinkPlayState,
  SlitherlinkPuzzle,
  SudokuGivens,
  SudokuPlayState,
} from '../puzzles/types';
import {
  renderEmojiGrid,
  type ShareCellTone,
  toneToEmoji,
} from './emojiGrid';

function isConflictAt(
  conflicts: { row: number; col: number }[],
  row: number,
  col: number,
): boolean {
  return conflicts.some((c) => c.row === row && c.col === col);
}

function summarizeRegion(
  merged: number[][],
  conflicts: { row: number; col: number }[],
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
  emptyValue = 0,
): ShareCellTone {
  let hasEmpty = false;
  let hasConflict = false;

  for (let row = rowStart; row < rowEnd; row += 1) {
    for (let col = colStart; col < colEnd; col += 1) {
      const value = merged[row]?.[col];
      if (value === emptyValue) {
        hasEmpty = true;
      }
      if (isConflictAt(conflicts, row, col)) {
        hasConflict = true;
      }
    }
  }

  if (hasEmpty) return 'empty';
  if (hasConflict) return 'warn';
  return 'complete';
}

function summarizeSudokuBox(
  merged: number[][],
  conflicts: { row: number; col: number }[],
  boxRow: number,
  boxCol: number,
): ShareCellTone {
  const rowStart = boxRow * SUDOKU_BOX;
  const colStart = boxCol * SUDOKU_BOX;
  return summarizeRegion(
    merged,
    conflicts,
    rowStart,
    rowStart + SUDOKU_BOX,
    colStart,
    colStart + SUDOKU_BOX,
  );
}

/** 数独 9 宫 → 3×3 emoji（九宫格摘要，无冗余横带行） */
export function summarizeSudokuGrid(
  play: SudokuPlayState,
  givens: SudokuGivens,
): string {
  const merged = mergeSudokuPlay(givens, play);
  const conflicts = getSudokuConflictCells(play, givens);

  const boxTone = (br: number, bc: number) =>
    summarizeSudokuBox(merged, conflicts, br, bc);

  const rows: ShareCellTone[][] = [
    [boxTone(0, 0), boxTone(0, 1), boxTone(0, 2)],
    [boxTone(1, 0), boxTone(1, 1), boxTone(1, 2)],
    [boxTone(2, 0), boxTone(2, 1), boxTone(2, 2)],
  ];

  return renderEmojiGrid(rows);
}

function summarizeBinaryBlock(
  merged: number[][],
  conflicts: { row: number; col: number }[],
  blockRow: number,
  blockCol: number,
  blockSize: number,
): ShareCellTone {
  const rowStart = blockRow * blockSize;
  const colStart = blockCol * blockSize;
  return summarizeRegion(
    merged,
    conflicts,
    rowStart,
    rowStart + blockSize,
    colStart,
    colStart + blockSize,
  );
}

/** 二进制 8×8 → 4×4（2×2 块摘要） */
export function summarizeBinaryGrid(
  play: BinaryPlayState,
  givens: BinaryGivens,
): string {
  const merged = mergeBinaryPlay(givens, play);
  const conflicts = getBinaryConflictCells(play, givens);
  const blockSize = 2;
  const blocksPerSide = BINARY_SIZE / blockSize;

  const rows: ShareCellTone[][] = [];
  for (let br = 0; br < blocksPerSide; br += 1) {
    const row: ShareCellTone[] = [];
    for (let bc = 0; bc < blocksPerSide; bc += 1) {
      row.push(summarizeBinaryBlock(merged, conflicts, br, bc, blockSize));
    }
    rows.push(row);
  }

  return renderEmojiGrid(rows);
}

function summarizeNonogramBlock(
  play: NonogramPlayState,
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
): ShareCellTone {
  let empty = 0;
  let decided = 0;

  for (let row = rowStart; row < rowEnd; row += 1) {
    for (let col = colStart; col < colEnd; col += 1) {
      const cell = play[row]?.[col];
      if (cell === NONOGRAM_EMPTY) {
        empty += 1;
      } else {
        decided += 1;
      }
    }
  }

  if (empty === (rowEnd - rowStart) * (colEnd - colStart)) return 'empty';
  if (empty > 0) return 'warn';
  return 'complete';
}

/** 数绘 8×8 → 4×4（仅 playState，不读 solution） */
export function summarizeNonogramGrid(play: NonogramPlayState): string {
  const blockSize = 2;
  const size = play.length;
  const blocksPerSide = size / blockSize;

  const rows: ShareCellTone[][] = [];
  for (let br = 0; br < blocksPerSide; br += 1) {
    const row: ShareCellTone[] = [];
    for (let bc = 0; bc < blocksPerSide; bc += 1) {
      row.push(
        summarizeNonogramBlock(
          play,
          br * blockSize,
          br * blockSize + blockSize,
          bc * blockSize,
          bc * blockSize + blockSize,
        ),
      );
    }
    rows.push(row);
  }

  return renderEmojiGrid(rows);
}

function blockHasConflict(
  conflicts: { h: boolean[][]; v: boolean[][] },
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
): boolean {
  for (let row = rowStart; row <= rowEnd; row += 1) {
    for (let col = colStart; col < colEnd; col += 1) {
      if (conflicts.h[row]?.[col]) return true;
    }
  }
  for (let row = rowStart; row < rowEnd; row += 1) {
    for (let col = colStart; col <= colEnd; col += 1) {
      if (conflicts.v[row]?.[col]) return true;
    }
  }
  return false;
}

function summarizeSlitherlinkBlock(
  play: SlitherlinkPlayState,
  conflicts: { h: boolean[][]; v: boolean[][] },
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
): ShareCellTone {
  if (blockHasConflict(conflicts, rowStart, rowEnd, colStart, colEnd)) {
    return 'warn';
  }

  let unknown = 0;
  let line = 0;

  for (let row = rowStart; row <= rowEnd; row += 1) {
    for (let col = colStart; col < colEnd; col += 1) {
      const state = play.h[row]?.[col];
      if (state === EDGE_UNKNOWN) unknown += 1;
      if (state === EDGE_LINE) line += 1;
    }
  }
  for (let row = rowStart; row < rowEnd; row += 1) {
    for (let col = colStart; col <= colEnd; col += 1) {
      const state = play.v[row]?.[col];
      if (state === EDGE_UNKNOWN) unknown += 1;
      if (state === EDGE_LINE) line += 1;
    }
  }

  if (unknown > 0 && line === 0) return 'empty';
  if (unknown > 0) return 'warn';
  return 'complete';
}

/** 数回 N×N → 4×4 块摘要（边与格分区；仅 playState + clues，不读 solution） */
export function summarizeSlitherlinkGrid(
  play: SlitherlinkPlayState,
  puzzle: Pick<SlitherlinkPuzzle, 'clues'>,
): string {
  const conflicts = getConflictEdges(play, puzzle);
  const blocksPerSide = 4;

  const rows: ShareCellTone[][] = [];
  for (let br = 0; br < blocksPerSide; br += 1) {
    const row: ShareCellTone[] = [];
    const rowStart = Math.floor((br * SLITHERLINK_SIZE) / blocksPerSide);
    const rowEndEx = Math.floor(((br + 1) * SLITHERLINK_SIZE) / blocksPerSide);
    for (let bc = 0; bc < blocksPerSide; bc += 1) {
      const colStart = Math.floor((bc * SLITHERLINK_SIZE) / blocksPerSide);
      const colEndEx = Math.floor(((bc + 1) * SLITHERLINK_SIZE) / blocksPerSide);
      row.push(
        summarizeSlitherlinkBlock(
          play,
          conflicts,
          rowStart,
          rowEndEx - 1,
          colStart,
          colEndEx,
        ),
      );
    }
    rows.push(row);
  }

  return renderEmojiGrid(rows);
}

/** 认怂时把 warn/complete 降级为 empty，保留 warn 提示（冲突格） */
export function softenGridForAbandon(grid: string): string {
  return grid
    .split('\n')
    .map((line) =>
      line
        .split('')
        .map((ch) => (ch === toneToEmoji('complete') ? toneToEmoji('empty') : ch))
        .join(''),
    )
    .join('\n');
}
