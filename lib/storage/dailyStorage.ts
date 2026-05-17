import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY, STORAGE_VERSION } from '../../constants/config';
import type { DailySnapshot } from '../puzzles/types';

function isDailySnapshot(value: unknown): value is DailySnapshot {
  if (value == null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const hasPuzzle = v.puzzle != null && typeof v.puzzle === 'object';
  const hasLegacyStub = v.puzzleStub != null && typeof v.puzzleStub === 'object';
  return (
    typeof v.dateKey === 'string' &&
    typeof v.gameType === 'string' &&
    typeof v.seed === 'number' &&
    typeof v.status === 'string' &&
    typeof v.puzzleHash === 'string' &&
    (hasPuzzle || hasLegacyStub)
  );
}

export async function loadDailySnapshot(): Promise<DailySnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isDailySnapshot(parsed)) {
      console.warn('[dailyStorage] invalid snapshot shape');
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('[dailyStorage] failed to load snapshot', error);
    return null;
  }
}

export async function saveDailySnapshot(snapshot: DailySnapshot): Promise<void> {
  const payload: DailySnapshot = { ...snapshot, version: STORAGE_VERSION };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function clearDailySnapshot(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
