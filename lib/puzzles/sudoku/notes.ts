import type { SudokuNotes } from '../types';
import { SUDOKU_SIZE } from './grid';

export function createEmptySudokuNotes(): SudokuNotes {
  return Array.from({ length: SUDOKU_SIZE }, () =>
    Array.from({ length: SUDOKU_SIZE }, () => 0),
  );
}

export function cloneSudokuNotes(notes: SudokuNotes): SudokuNotes {
  return notes.map((row) => row.slice());
}

/** Toggle digit candidate bit N (1–9) on a cell mask. */
export function toggleNoteDigit(mask: number, digit: number): number {
  if (digit < 1 || digit > 9) return mask;
  const bit = 1 << digit;
  return (mask & bit) !== 0 ? mask & ~bit : mask | bit;
}

export function noteHasDigit(mask: number, digit: number): boolean {
  if (digit < 1 || digit > 9) return false;
  return (mask & (1 << digit)) !== 0;
}
