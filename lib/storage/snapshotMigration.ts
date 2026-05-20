import { STORAGE_VERSION } from '../../constants/config';
import type { DailySnapshot } from '../puzzles/types';
import { normalizeSnapshotToV2 } from './snapshotPrep';
import { isPersistedSnapshotShape } from './snapshotValidate';

/**
 * Parse persisted JSON and normalize to current STORAGE_VERSION (v2).
 * v1 puzzleStub / placeholder puzzles are upgraded here, not in context.
 */
export function migrateSnapshot(raw: unknown): DailySnapshot | null {
  if (!isPersistedSnapshotShape(raw)) {
    return null;
  }

  const version =
    typeof raw.version === 'number' ? raw.version : 0;

  if (version > STORAGE_VERSION) {
    console.warn(
      '[snapshotMigration] snapshot version newer than app',
      version,
      '>',
      STORAGE_VERSION,
    );
    return null;
  }

  return normalizeSnapshotToV2(raw);
}
