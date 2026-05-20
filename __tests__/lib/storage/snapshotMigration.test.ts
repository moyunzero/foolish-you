import { STORAGE_VERSION } from '../../../constants/config';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
import { migrateSnapshot } from '../../../lib/storage/snapshotMigration';
import { isSnapshotPuzzleConsistent } from '../../../lib/storage/snapshotValidate';

describe('snapshotMigration', () => {
  it('rejects non-objects', () => {
    expect(migrateSnapshot(null)).toBeNull();
    expect(migrateSnapshot('x')).toBeNull();
  });

  it('stamps missing version to STORAGE_VERSION', () => {
    const raw = {
      dateKey: '2026-05-18',
      gameType: 'binary',
      seed: 9,
      status: 'playing',
      puzzle: {
        kind: 'binary',
        givens: createEmptyBinaryGrid(),
        puzzleHash: 'h',
      },
      puzzleHash: 'h',
    };
    const migrated = migrateSnapshot(raw);
    expect(migrated?.version).toBe(STORAGE_VERSION);
    expect(isSnapshotPuzzleConsistent(migrated!)).toBe(true);
  });

  it('upgrades v1 puzzleStub to v2 without legacy fields', () => {
    const raw = {
      version: 1,
      dateKey: '2026-05-18',
      gameType: 'sudoku',
      seed: 4242,
      status: 'playing',
      puzzle: { kind: 'sudoku', placeholder: true },
      puzzleHash: 'legacy',
      puzzleStub: { kind: 'sudoku', placeholder: true },
    };
    const migrated = migrateSnapshot(raw);
    expect(migrated?.version).toBe(STORAGE_VERSION);
    expect(migrated).not.toHaveProperty('puzzleStub');
    expect(isSnapshotPuzzleConsistent(migrated!)).toBe(true);
    expect(migrated?.gameType).toBe('sudoku');
  });

  it('rejects snapshots newer than app version', () => {
    const raw = {
      version: STORAGE_VERSION + 1,
      dateKey: '2026-05-18',
      gameType: 'binary',
      seed: 9,
      status: 'playing',
      puzzle: {
        kind: 'binary',
        givens: createEmptyBinaryGrid(),
        puzzleHash: 'h',
      },
      puzzleHash: 'h',
    };
    expect(migrateSnapshot(raw)).toBeNull();
  });
});
