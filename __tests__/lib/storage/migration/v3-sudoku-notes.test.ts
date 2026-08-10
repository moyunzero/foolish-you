import { STORAGE_VERSION } from '../../../../constants/config';
import { generateBinaryPuzzle } from '../../../../lib/puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../../lib/puzzles/binary/grid';
import { generateSudokuPuzzle } from '../../../../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../../lib/puzzles/sudoku/grid';
import { isCompleteAndValid } from '../../../../lib/puzzles/sudoku/validate';
import type { DailySnapshot, SudokuNotes } from '../../../../lib/puzzles/types';
import { migrateSnapshot } from '../../../../lib/storage/snapshotMigration';
import { recoverSnapshot } from '../../../../lib/storage/snapshotRecover';
import {
  isSnapshotPuzzleConsistent,
  sanitizeSnapshotForSave,
} from '../../../../lib/storage/snapshotValidate';

/** bits 1–9 set — digit candidates 1..9 */
const FULL_CELL_MASK = 0b1111111110;

function emptyNotes(): SudokuNotes {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
}

function baseSudokuSnapshot(
  overrides: Partial<DailySnapshot> = {},
): DailySnapshot {
  const puzzle = generateSudokuPuzzle(6003);
  return {
    version: 2,
    dateKey: '2026-08-10',
    gameType: 'sudoku',
    seed: 6003,
    status: 'playing',
    puzzle,
    puzzleHash: puzzle.puzzleHash,
    playState: createEmptySudokuGrid(),
    startedAt: Date.now() - 10_000,
    ...overrides,
  };
}

describe('migration v3 sudokuNotes', () => {
  it('STORAGE_VERSION is 3', () => {
    expect(STORAGE_VERSION).toBe(3);
  });

  it('v2 sudoku snapshot migrates to version 3 without notes', () => {
    const v2 = baseSudokuSnapshot({ version: 2 });
    const migrated = migrateSnapshot(v2);
    expect(migrated).not.toBeNull();
    expect(migrated!.version).toBe(3);
    expect(migrated!.sudokuNotes).toBeUndefined();
    expect(migrated!.playState).toEqual(v2.playState);
    expect(isSnapshotPuzzleConsistent(migrated!)).toBe(true);
  });

  it('valid sudokuNotes round-trip through sanitize when gameType is sudoku', () => {
    const notes = emptyNotes();
    notes[0]![0] = 1 << 5; // candidate 5
    const snapshot = baseSudokuSnapshot({
      version: 3,
      sudokuNotes: notes,
    });
    const clean = sanitizeSnapshotForSave(snapshot);
    expect(clean.version).toBe(STORAGE_VERSION);
    expect(clean.sudokuNotes).toEqual(notes);
    expect(clean.playState).toEqual(snapshot.playState);
  });

  it('strips sudokuNotes when a cell exceeds the notes bit mask', () => {
    const notes = emptyNotes();
    // Survives Int32 coercion of `& ~MASK` but exceeds digit-candidate range.
    notes[0]![0] = 0x1_0000_0002;
    const snapshot = baseSudokuSnapshot({
      version: 3,
      sudokuNotes: notes,
    });
    const clean = sanitizeSnapshotForSave(snapshot);
    expect(clean.sudokuNotes).toBeUndefined();
  });

  it('sanitize strips unknown keys and omits notes for non-sudoku', () => {
    const notes = emptyNotes();
    notes[1]![1] = FULL_CELL_MASK;
    const puzzle = generateBinaryPuzzle(7001);
    const snapshot = {
      version: 3,
      dateKey: '2026-08-10',
      gameType: 'binary' as const,
      seed: 7001,
      status: 'playing' as const,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: createEmptyBinaryGrid(),
      sudokuNotes: notes,
      legacyJunk: true,
    };
    const clean = sanitizeSnapshotForSave(snapshot as DailySnapshot);
    expect(clean.sudokuNotes).toBeUndefined();
    expect((clean as Record<string, unknown>).legacyJunk).toBeUndefined();
    expect(clean.playState).toEqual(snapshot.playState);
  });

  it('invalid sudokuNotes shape is stripped; playState kept', () => {
    const play = createEmptySudokuGrid();
    play[0]![2] = 4;
    const raw = {
      ...baseSudokuSnapshot({ version: 2, playState: play }),
      sudokuNotes: [[1, 2], 'bad'],
    };
    const migrated = migrateSnapshot(raw);
    expect(migrated).not.toBeNull();
    expect(migrated!.version).toBe(3);
    expect(migrated!.playState).toEqual(play);
    expect(migrated!.sudokuNotes).toBeUndefined();

    const recovered = recoverSnapshot(migrated!);
    expect(recovered.snapshot.playState).toEqual(play);
    expect(recovered.snapshot.sudokuNotes).toBeUndefined();
  });

  it('missing sudokuNotes is valid (omit)', () => {
    const snapshot = baseSudokuSnapshot({ version: 3 });
    const clean = sanitizeSnapshotForSave(snapshot);
    expect('sudokuNotes' in clean).toBe(false);
  });

  it('D-09: notes-only board (empty digits) is not complete under isCompleteAndValid', () => {
    const puzzle = generateSudokuPuzzle(6005);
    const play = createEmptySudokuGrid();
    const notes = emptyNotes();
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (puzzle.givens[r]![c] === 0) {
          notes[r]![c] = FULL_CELL_MASK;
        }
      }
    }
    // Completion API only sees digits — notes sibling is never an argument.
    expect(isCompleteAndValid(play, puzzle.givens)).toBe(false);
    expect(notes.flat().some((m) => m !== 0)).toBe(true);
  });
});
