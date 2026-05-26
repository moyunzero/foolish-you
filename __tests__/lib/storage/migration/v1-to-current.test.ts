import * as fs from 'node:fs';
import * as path from 'node:path';

import { STORAGE_VERSION } from '../../../../constants/config';
import { migrateSnapshot } from '../../../../lib/storage/snapshotMigration';
import { isSnapshotPuzzleConsistent } from '../../../../lib/storage/snapshotValidate';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

function loadFixture(name: string): unknown {
  const raw = fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
  return JSON.parse(raw);
}

describe('migration v1 fixtures → current', () => {
  it.each(['v1-sudoku-mid-game.json', 'v1-binary-completed.json'])(
    'migrates %s to v%d with consistent puzzle',
    (fileName) => {
      const migrated = migrateSnapshot(loadFixture(fileName));
      expect(migrated).not.toBeNull();
      expect(migrated?.version).toBe(STORAGE_VERSION);
      expect(isSnapshotPuzzleConsistent(migrated!)).toBe(true);
      expect(migrated).not.toHaveProperty('puzzleStub');
    },
  );
});
