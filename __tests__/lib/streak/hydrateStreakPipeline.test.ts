import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  needsStreakReconcile,
  reconcileStreakForCompletedDay,
} from '../../../lib/streak/reconcileStreak';
import {
  reconcileStreakOnOpen,
  repairStreakFromYesterdayCompletion,
} from '../../../lib/streak/freezeLogic';
import { loadCompletionHistory } from '../../../lib/storage/completionHistoryStorage';
import { saveDailySnapshot } from '../../../lib/storage/dailyStorage';
import { loadStreakState, saveStreakState } from '../../../lib/storage/streakStorage';
import {
  FIXTURE_TODAY,
  FIXTURE_YESTERDAY,
  makeBinaryPlayingSnapshot,
} from '../../helpers/dailyGameFixtures';

/** Mirror DailyGameContext loadHydratedState Freeze clocks (wall + active playing). */
async function runHydrateStreakPipeline(options?: {
  wallTodayKey?: string;
  openingDateKey?: string;
}) {
  const wallTodayKey = options?.wallTodayKey ?? FIXTURE_TODAY;
  const openingDateKey = options?.openingDateKey ?? wallTodayKey;
  const next = makeBinaryPlayingSnapshot({ dateKey: openingDateKey });
  const loadedStreak = await loadStreakState();

  let streakState = loadedStreak;

  if (needsStreakReconcile(next, loadedStreak)) {
    streakState = reconcileStreakForCompletedDay(next, loadedStreak);
  }

  const history = await loadCompletionHistory();
  const entries = history.entries;

  const activePlayingDateKey =
    next.status === 'playing' ? next.dateKey : undefined;

  const repaired = repairStreakFromYesterdayCompletion(
    streakState,
    wallTodayKey,
    entries,
  );
  if (repaired != null) {
    streakState = repaired;
  }

  streakState = reconcileStreakOnOpen(streakState, wallTodayKey, {
    historyEntries: entries,
    activePlayingDateKey,
  });

  if (JSON.stringify(streakState) !== JSON.stringify(loadedStreak)) {
    await saveStreakState(streakState);
  }

  return { next, streakState, loadedStreak, entries, wallTodayKey };
}

describe('hydrate streak pipeline (no React)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('consumes freeze with yesterday anchor when opening === wall', async () => {
    await saveStreakState({
      currentStreak: 5,
      lastCheckInDateKey: '2026-05-17',
      historicalMax: 8,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
    });
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    const { streakState, next } = await runHydrateStreakPipeline();

    expect(next.status).toBe('playing');
    expect(streakState?.lastCheckInDateKey).toBe('2026-05-18');
    expect(streakState?.freezeConsumedSessionKey).toBe(FIXTURE_TODAY);
    await expect(loadStreakState()).resolves.toMatchObject({
      lastCheckInDateKey: '2026-05-18',
      currentStreak: 5,
    });
  });

  it('does not false-burn freeze when carry opening is yesterday (M1)', async () => {
    await saveStreakState({
      currentStreak: 5,
      lastCheckInDateKey: '2026-05-17',
      historicalMax: 8,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
      freezeConsumedDateKeys: [],
    });
    await saveDailySnapshot(
      makeBinaryPlayingSnapshot({ dateKey: FIXTURE_YESTERDAY }),
    );

    const { streakState, next } = await runHydrateStreakPipeline({
      wallTodayKey: FIXTURE_TODAY,
      openingDateKey: FIXTURE_YESTERDAY,
    });

    expect(next.status).toBe('playing');
    expect(next.dateKey).toBe(FIXTURE_YESTERDAY);
    expect(streakState?.freezeCount).toBe(1);
    expect(streakState?.lastCheckInDateKey).toBe('2026-05-17');
    expect(streakState?.freezeConsumedSessionKey).toBeNull();
  });
});
