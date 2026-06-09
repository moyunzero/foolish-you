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
  makeBinaryPlayingSnapshot,
} from '../../helpers/dailyGameFixtures';

async function runHydrateStreakPipeline() {
  const next = makeBinaryPlayingSnapshot();
  const loadedStreak = await loadStreakState();

  let streakState = loadedStreak;

  if (needsStreakReconcile(next, loadedStreak)) {
    streakState = reconcileStreakForCompletedDay(next, loadedStreak);
  }

  const history = await loadCompletionHistory();
  const entries = history.entries;

  const repaired = repairStreakFromYesterdayCompletion(
    streakState,
    next.dateKey,
    entries,
  );
  if (repaired != null) {
    streakState = repaired;
  }

  streakState = reconcileStreakOnOpen(streakState, next.dateKey, {
    historyEntries: entries,
  });

  if (JSON.stringify(streakState) !== JSON.stringify(loadedStreak)) {
    await saveStreakState(streakState);
  }

  return { next, streakState, loadedStreak, entries };
}

describe('hydrate streak pipeline (no React)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('consumes freeze with yesterday anchor', async () => {
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
});
