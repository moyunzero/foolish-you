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
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
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
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
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
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
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
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
    });
  });

  it('migrates v2 payload with default freeze fields', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        currentStreak: 6,
        lastCheckInDateKey: '2026-05-18',
        historicalMax: 9,
      }),
    );
    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 6,
      lastCheckInDateKey: '2026-05-18',
      historicalMax: 9,
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
    });
  });

  it('rejects freezeCount greater than 2', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        version: 3,
        currentStreak: 1,
        lastCheckInDateKey: '2026-05-20',
        historicalMax: 1,
        freezeCount: 3,
      }),
    );
    await expect(loadStreakState()).resolves.toBeNull();
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
