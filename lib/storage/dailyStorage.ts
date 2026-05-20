import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from '../../constants/config';
import type { DailySnapshot } from '../puzzles/types';
import { migrateSnapshot } from './snapshotMigration';
import { sanitizeSnapshotForSave } from './snapshotValidate';

export async function loadDailySnapshot(): Promise<DailySnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    const migrated = migrateSnapshot(parsed);
    if (migrated == null) {
      console.warn('[dailyStorage] invalid or unsupported snapshot');
      return null;
    }
    return migrated;
  } catch (error) {
    console.warn('[dailyStorage] failed to load snapshot', error);
    return null;
  }
}

/** @returns false when persistence failed */
export async function saveDailySnapshot(
  snapshot: DailySnapshot,
): Promise<boolean> {
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
