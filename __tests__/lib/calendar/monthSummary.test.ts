import {
  computeMonthSummary,
  countMonthCompletedDays,
} from '../../../lib/calendar/monthSummary';
import { EMPTY_STREAK_STATE } from '../../../lib/streak/types';

describe('countMonthCompletedDays', () => {
  const monthKey = '2026-05';

  it('counts only non-inferred completed days (D-18)', () => {
    expect(
      countMonthCompletedDays(
        [
          { dateKey: '2026-05-01', elapsedMs: 1000 },
          { dateKey: '2026-05-02', elapsedMs: 1000, inferred: true },
          { dateKey: '2026-05-03', elapsedMs: 1000, outcome: 'abandoned' },
          { dateKey: '2026-04-30', elapsedMs: 1000 },
        ],
        monthKey,
      ),
    ).toBe(1);
  });
});

describe('computeMonthSummary', () => {
  it('is deterministic for same monthKey and seed', () => {
    const input = {
      monthKey: '2026-05',
      entries: [{ dateKey: '2026-05-19', elapsedMs: 60_000 }],
      streak: { ...EMPTY_STREAK_STATE, currentStreak: 3 },
      seed: 42,
      locale: 'zh' as const,
    };

    const a = computeMonthSummary(input);
    const b = computeMonthSummary(input);
    expect(a).toEqual(b);
    expect(a.currentStreak).toBe(3);
    expect(a.monthCompletedCount).toBe(1);
    expect(a.summaryTaunt.length).toBeGreaterThan(0);
  });

  it('uses English pool without CJK when locale is en', () => {
    const summary = computeMonthSummary({
      monthKey: '2026-05',
      entries: [],
      streak: null,
      seed: 99,
      locale: 'en',
    });
    expect(summary.summaryTaunt).not.toMatch(/[\u4e00-\u9fff]/);
  });
});
