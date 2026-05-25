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
    const state = { currentStreak: 3, lastCheckInDateKey: '2026-05-24' };
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
