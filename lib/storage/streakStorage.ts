import AsyncStorage from '@react-native-async-storage/async-storage';

import { STREAK_STORAGE_KEY, STREAK_STORAGE_VERSION } from '../../constants/config';
import type { StreakState } from '../streak/types';

type PersistedStreakPayload = StreakState & {
  version: number;
};

function isStreakState(value: unknown): value is StreakState {
  if (value == null || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.currentStreak === 'number' &&
    Number.isFinite(row.currentStreak) &&
    row.currentStreak >= 0 &&
    (row.lastCheckInDateKey === null ||
      (typeof row.lastCheckInDateKey === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(row.lastCheckInDateKey)))
  );
}

function normalizePersistedStreak(raw: unknown): StreakState | null {
  if (raw == null || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const version = typeof row.version === 'number' ? row.version : 1;

  if (!isStreakState(row)) return null;

  if (version > STREAK_STORAGE_VERSION) {
    console.warn(
      '[streakStorage] streak version newer than app',
      version,
      '>',
      STREAK_STORAGE_VERSION,
    );
    return null;
  }

  return {
    currentStreak: Math.floor(row.currentStreak as number),
    lastCheckInDateKey: row.lastCheckInDateKey as string | null,
  };
}

export async function loadStreakState(): Promise<StreakState | null> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    const normalized = normalizePersistedStreak(parsed);
    if (normalized == null) {
      console.warn('[streakStorage] invalid streak payload');
    }
    return normalized;
  } catch (error) {
    console.warn('[streakStorage] failed to load streak', error);
    return null;
  }
}

/** @returns false when persistence failed */
export async function saveStreakState(state: StreakState): Promise<boolean> {
  try {
    const payload: PersistedStreakPayload = {
      ...state,
      version: STREAK_STORAGE_VERSION,
    };
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[streakStorage] failed to save streak', error);
    return false;
  }
}

export async function clearStreakState(): Promise<void> {
  await AsyncStorage.removeItem(STREAK_STORAGE_KEY);
}
