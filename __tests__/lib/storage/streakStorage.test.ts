import AsyncStorage from '@react-native-async-storage/async-storage';

import { STREAK_STORAGE_KEY, STREAK_STORAGE_VERSION } from '../../../constants/config';
import {
  clearStreakState,
  loadStreakState,
  saveStreakState,
} from '../../../lib/storage/streakStorage';

describe('streakStorage', () => {
  beforeEach(async () => {
    await clearStreakState();
  });

  it('returns null when empty', async () => {
    await expect(loadStreakState()).resolves.toBeNull();
  });

  it('round-trips streak state with version metadata', async () => {
    const state = {
      currentStreak: 3,
      lastCheckInDateKey: '2026-05-24',
      historicalMax: 5,
    };
    await expect(saveStreakState(state)).resolves.toBe(true);
    await expect(loadStreakState()).resolves.toEqual(state);
    const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    expect(raw).toContain(`"version":${STREAK_STORAGE_VERSION}`);
    expect(raw).toContain('"currentStreak":3');
  });

  it('loads legacy payload without version field', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        currentStreak: 2,
        lastCheckInDateKey: '2026-05-20',
      }),
    );
    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 2,
      lastCheckInDateKey: '2026-05-20',
      historicalMax: 2,
    });
  });

  it('migrates v1 payload without historicalMax using currentStreak', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        currentStreak: 4,
        lastCheckInDateKey: '2026-05-18',
      }),
    );
    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-18',
      historicalMax: 4,
    });
  });

  it('preserves historicalMax when greater than current', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        currentStreak: 3,
        lastCheckInDateKey: '2026-05-19',
        historicalMax: 12,
      }),
    );
    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 3,
      lastCheckInDateKey: '2026-05-19',
      historicalMax: 12,
    });
  });

  it('rejects streak payload newer than app version', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        version: STREAK_STORAGE_VERSION + 1,
        currentStreak: 1,
        lastCheckInDateKey: '2026-05-20',
      }),
    );
    await expect(loadStreakState()).resolves.toBeNull();
  });

  it('returns null for invalid payload', async () => {
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, '{"currentStreak":-1}');
    await expect(loadStreakState()).resolves.toBeNull();
  });
});
