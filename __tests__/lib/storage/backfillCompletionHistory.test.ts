import {
  getActiveStreakDateKeys,
  mergeBackfillFromStreak,
} from '../../../lib/storage/backfillCompletionHistory';
import {
  clearCompletionHistory,
  loadCompletionHistory,
  recordCompletion,
} from '../../../lib/storage/completionHistoryStorage';
import { clearStreakState, saveStreakState } from '../../../lib/storage/streakStorage';
import { countWeeklyCompleted } from '../../../lib/stats/weeklyCompletedCount';

describe('getActiveStreakDateKeys', () => {
  it('returns empty when streak is zero', () => {
    expect(
      getActiveStreakDateKeys({
        currentStreak: 0,
        lastCheckInDateKey: '2026-05-26',
        historicalMax: 5,
      }),
    ).toEqual([]);
  });

  it('returns consecutive days ending at lastCheckIn', () => {
    expect(
      getActiveStreakDateKeys({
        currentStreak: 2,
        lastCheckInDateKey: '2026-05-26',
        historicalMax: 17,
      }),
    ).toEqual(['2026-05-25', '2026-05-26']);
  });
});

describe('mergeBackfillFromStreak', () => {
  it('does not use historicalMax for backfill span', () => {
    const { state, added } = mergeBackfillFromStreak(
      { entries: [] },
      {
        currentStreak: 2,
        lastCheckInDateKey: '2026-05-26',
        historicalMax: 17,
      },
    );
    expect(added).toBe(2);
    expect(state.entries.map((e) => e.dateKey)).toEqual(['2026-05-25', '2026-05-26']);
    expect(state.entries.every((e) => e.inferred === true)).toBe(true);
  });

  it('fills only missing keys when partial history exists', () => {
    const { state, added } = mergeBackfillFromStreak(
      { entries: [{ dateKey: '2026-05-26', elapsedMs: 120_000 }] },
      {
        currentStreak: 2,
        lastCheckInDateKey: '2026-05-26',
        historicalMax: 2,
      },
    );
    expect(added).toBe(1);
    expect(state.entries.map((e) => e.dateKey)).toEqual(['2026-05-25', '2026-05-26']);
    const today = state.entries.find((e) => e.dateKey === '2026-05-26');
    expect(today?.inferred).toBeUndefined();
    expect(today?.elapsedMs).toBe(120_000);
  });
});

describe('loadCompletionHistory backfill', () => {
  beforeEach(async () => {
    await clearCompletionHistory();
    await clearStreakState();
  });

  it('aligns weekly count with active streak after upgrade', async () => {
    await saveStreakState({
      currentStreak: 2,
      lastCheckInDateKey: '2026-05-26',
      historicalMax: 2,
    });

    const history = await loadCompletionHistory();
    expect(history.entries).toHaveLength(2);
    await expect(countWeeklyCompleted('2026-05-26')).resolves.toBe(2);
  });

  it('re-backfills after dev clears completion history only', async () => {
    await saveStreakState({
      currentStreak: 2,
      lastCheckInDateKey: '2026-05-26',
      historicalMax: 2,
    });
    await loadCompletionHistory();
    await clearCompletionHistory();

    // countWeeklyCompleted → loadCompletionHistory → gap-fill from streak
    await expect(countWeeklyCompleted('2026-05-26')).resolves.toBe(2);
  });

  it('recordCompletion replaces inferred row with real elapsed', async () => {
    await saveStreakState({
      currentStreak: 2,
      lastCheckInDateKey: '2026-05-26',
      historicalMax: 2,
    });
    await loadCompletionHistory();
    await recordCompletion('2026-05-26', 185_000);

    const history = await loadCompletionHistory();
    const today = history.entries.find((e) => e.dateKey === '2026-05-26');
    expect(today?.elapsedMs).toBe(185_000);
    expect(today?.inferred).toBeUndefined();
  });
});
