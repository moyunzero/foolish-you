import AsyncStorage from '@react-native-async-storage/async-storage';

import { STREAK_STORAGE_KEY, STREAK_STORAGE_VERSION } from '../../../../constants/config';
import { loadStreakState } from '../../../../lib/storage/streakStorage';

describe('streak storage v3 → v4 migration', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem(STREAK_STORAGE_KEY);
  });

  it('defaults freezeConsumedDateKeys to empty array for v3 payload', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        version: 3,
        currentStreak: 4,
        lastCheckInDateKey: '2026-05-20',
        historicalMax: 6,
        freezeCount: 1,
        lastFreezeGrantWeekKey: '2026-W21',
        freezeConsumedSessionKey: null,
      }),
    );

    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-20',
      historicalMax: 6,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
    });
  });

  it('persists freezeConsumedDateKeys on save at v4', async () => {
    await AsyncStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        version: STREAK_STORAGE_VERSION,
        currentStreak: 2,
        lastCheckInDateKey: '2026-05-21',
        historicalMax: 2,
        freezeCount: 0,
        lastFreezeGrantWeekKey: '2026-W21',
        freezeConsumedSessionKey: null,
        freezeConsumedDateKeys: ['2026-05-20'],
      }),
    );

    const loaded = await loadStreakState();
    expect(loaded?.freezeConsumedDateKeys).toEqual(['2026-05-20']);
  });
});
