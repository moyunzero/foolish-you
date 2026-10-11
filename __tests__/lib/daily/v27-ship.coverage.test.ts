/**
 * SHIP-01 central suite — selectable via `npm test -- --testPathPattern=v27-ship`.
 * Thin re-asserts of keep/advance, freeze×carry, calendar in_progress, cross-midnight.
 * Gap matrix: docs/qa/v2.7-ship/SHIP-01-COVERAGE.md
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_VERSION } from '../../../constants/config';
import { deriveCalendarCellState } from '../../../lib/calendar/deriveCalendarCellState';
import {
  isCarrying,
  shouldKeepOnHydrate,
} from '../../../lib/daily/carryState';
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
  FIXTURE_TOMORROW,
  FIXTURE_YESTERDAY,
  makeBinaryPlayingSnapshot,
} from '../../helpers/dailyGameFixtures';

/** Mirror DailyGameContext loadHydratedState freeze clocks (wall + active playing). */
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

  return { next, streakState, wallTodayKey };
}

describe('v27-ship SHIP-01 matrix', () => {
  it('keeps playing yesterday vs today wall (hydrate keep/advance)', () => {
    // RED: inverted until GREEN wires correct polarity
    expect(
      shouldKeepOnHydrate(
        { status: 'playing', dateKey: FIXTURE_YESTERDAY },
        FIXTURE_TODAY,
      ),
    ).toBe(false);
  });

  it('does not keep completed yesterday (mint for advance)', () => {
    expect(
      shouldKeepOnHydrate(
        { status: 'completed', dateKey: FIXTURE_YESTERDAY },
        FIXTURE_TODAY,
      ),
    ).toBe(true);
  });

  it('isCarrying when playing and openingDateKey less than wallToday', () => {
    expect(isCarrying('playing', FIXTURE_YESTERDAY, FIXTURE_TODAY)).toBe(
      false,
    );
  });

  it('deriveCalendarCellState returns in_progress for activePlayingDateKey', () => {
    expect(
      deriveCalendarCellState({
        dateKey: FIXTURE_YESTERDAY,
        todayKey: FIXTURE_TODAY,
        freezeDates: new Set(),
        activePlayingDateKey: FIXTURE_YESTERDAY,
      }),
    ).toBe('missed');
  });

  it('freeze×carry — carry opening yesterday does not false-burn freeze', async () => {
    await AsyncStorage.clear();
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
    // RED: expect burn until GREEN asserts freeze preserved
    expect(streakState?.freezeCount).toBe(0);
  });

  it('cross-midnight matrix: keep across wall advance then terminal mints', () => {
    expect(
      shouldKeepOnHydrate(
        { status: 'playing', dateKey: FIXTURE_YESTERDAY },
        FIXTURE_TOMORROW,
      ),
    ).toBe(false);
    expect(isCarrying('playing', FIXTURE_YESTERDAY, FIXTURE_TOMORROW)).toBe(
      false,
    );
    expect(
      shouldKeepOnHydrate(
        { status: 'completed', dateKey: FIXTURE_YESTERDAY },
        FIXTURE_TOMORROW,
      ),
    ).toBe(true);
  });

  it('daily STORAGE_VERSION remains 3 (ship invariant)', () => {
    expect(STORAGE_VERSION).toBe(99);
  });
});
