import {
  isDailySnapshotShape,
  isCompletedPlayStateSatisfied,
  isPlayStateConsistent,
  isSnapshotPuzzleConsistent,
  isValidBinaryGivens,
  isValidSlitherlinkPlayState,
  isValidSudokuGivens,
} from '../../../lib/storage/snapshotValidate';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
import { generateSlitherlinkPuzzle } from '../../../lib/puzzles/slitherlink/generator';
import { createEmptyPlayState } from '../../../lib/puzzles/slitherlink/edges';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import type { DailySnapshot } from '../../../lib/puzzles/types';
import type { PersistedSnapshot } from '../../../lib/storage/snapshotLegacy';

describe('snapshotValidate', () => {
  it('accepts valid sudoku givens', () => {
    expect(isValidSudokuGivens(createEmptySudokuGrid())).toBe(true);
  });

  it('rejects malformed sudoku givens', () => {
    expect(isValidSudokuGivens([[1]])).toBe(false);
  });

  it('accepts valid binary givens', () => {
    expect(isValidBinaryGivens(createEmptyBinaryGrid())).toBe(true);
  });

  it('accepts v1 placeholder on disk but not as consistent v2 snapshot', () => {
    const persisted: PersistedSnapshot = {
      version: 1,
      dateKey: '2026-05-18',
      gameType: 'binary',
      seed: 1,
      status: 'playing',
      puzzle: { kind: 'binary', placeholder: true },
      puzzleHash: 'x',
      puzzleStub: { kind: 'binary', placeholder: true },
    };
    expect(isDailySnapshotShape(persisted)).toBe(true);
    expect(
      isSnapshotPuzzleConsistent(persisted as unknown as DailySnapshot),
    ).toBe(false);
  });

  it('detects gameType vs puzzle mismatch', () => {
    const snapshot: DailySnapshot = {
      version: 2,
      dateKey: '2026-05-18',
      gameType: 'sudoku',
      seed: 1,
      status: 'playing',
      puzzle: {
        kind: 'binary',
        givens: createEmptyBinaryGrid(),
        puzzleHash: 'bin',
      },
      puzzleHash: 'bin',
    };
    expect(isSnapshotPuzzleConsistent(snapshot)).toBe(false);
  });

  it('accepts slitherlink playing snapshot with empty edge playState', () => {
    const puzzle = generateSlitherlinkPuzzle(909);
    const playState = createEmptyPlayState();
    const snapshot: DailySnapshot = {
      version: 2,
      dateKey: '2026-05-18',
      gameType: 'slitherlink',
      seed: 909,
      status: 'playing',
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState,
    };
    expect(isDailySnapshotShape(snapshot as unknown as PersistedSnapshot)).toBe(
      true,
    );
    expect(isSnapshotPuzzleConsistent(snapshot)).toBe(true);
    expect(isPlayStateConsistent(snapshot)).toBe(true);
    expect(isValidSlitherlinkPlayState(playState)).toBe(true);
  });

  it('accepts slitherlink completed snapshot when play matches solution', () => {
    const puzzle = generateSlitherlinkPuzzle(910);
    const snapshot: DailySnapshot = {
      version: 2,
      dateKey: '2026-05-18',
      gameType: 'slitherlink',
      seed: 910,
      status: 'completed',
      puzzle,
      puzzleHash: puzzle.puzzleHash,
      playState: puzzle.solution,
      finishedAt: Date.now(),
    };
    expect(isSnapshotPuzzleConsistent(snapshot)).toBe(true);
    expect(isPlayStateConsistent(snapshot)).toBe(true);
    expect(isCompletedPlayStateSatisfied(snapshot)).toBe(true);
  });
});
