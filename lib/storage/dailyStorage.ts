import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from '../../constants/config';
import type { DailySnapshot } from '../puzzles/types';
import { appendRecoveryLog } from './recoveryLog';
import { recoverSnapshot } from './snapshotRecover';
import { migrateSnapshot } from './snapshotMigration';
import {
  isPersistedSnapshotShape,
  isPlayStateConsistent,
  isSnapshotPuzzleConsistent,
  sanitizeSnapshotForSave,
} from './snapshotValidate';

export async function loadDailySnapshot(): Promise<DailySnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      await appendRecoveryLog({
        kind: 'structural',
        detail: 'JSON parse failed',
      });
      console.warn('[dailyStorage] invalid or unsupported snapshot');
      return null;
    }

    if (!isPersistedSnapshotShape(parsed)) {
      await appendRecoveryLog({
        kind: 'structural',
        detail: 'persisted shape invalid',
      });
      console.warn('[dailyStorage] invalid or unsupported snapshot');
      return null;
    }

    const migrated = migrateSnapshot(parsed);
    if (migrated == null) {
      const dateKey =
        typeof (parsed as Record<string, unknown>).dateKey === 'string'
          ? ((parsed as Record<string, unknown>).dateKey as string)
          : undefined;
      await appendRecoveryLog({
        kind: 'structural',
        dateKey,
        detail: 'migration rejected (version or shape)',
      });
      console.warn('[dailyStorage] invalid or unsupported snapshot');
      return null;
    }

    const recovered = recoverSnapshot(migrated);
    if (recovered.logKind != null) {
      await appendRecoveryLog({
        kind: recovered.logKind,
        dateKey: recovered.snapshot.dateKey,
        detail: recovered.detail,
      });
    }

    if (recovered.damage !== 'none') {
      const saved = await saveDailySnapshot(recovered.snapshot);
      if (!saved) {
        console.warn('[dailyStorage] failed to persist recovered snapshot');
      }
    }

    return recovered.snapshot;
  } catch (error) {
    console.warn('[dailyStorage] failed to load snapshot', error);
    return null;
  }
}

/** @returns false when persistence failed */
export async function saveDailySnapshot(
  snapshot: DailySnapshot,
): Promise<boolean> {
  if (!isSnapshotPuzzleConsistent(snapshot)) {
    console.warn('[dailyStorage] refusing to save inconsistent puzzle');
    return false;
  }
  if (snapshot.playState != null && !isPlayStateConsistent(snapshot)) {
    console.warn('[dailyStorage] refusing to save inconsistent playState');
    return false;
  }

  try {
    const payload = sanitizeSnapshotForSave(snapshot);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[dailyStorage] failed to save snapshot', error);
    return false;
  }
}

export async function clearDailySnapshot(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
