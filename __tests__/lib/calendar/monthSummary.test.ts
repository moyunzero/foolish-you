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

  describe('growthDelta (D-18 / first-month suppression)', () => {
    const base = {
      monthKey: '2026-05',
      streak: null,
      seed: 42,
      locale: 'zh' as const,
    };

    it('is positive when this month > last month (>0)', () => {
      const summary = computeMonthSummary({
        ...base,
        entries: [
          { dateKey: '2026-04-01', elapsedMs: 1000 },
          { dateKey: '2026-04-02', elapsedMs: 1000 },
          { dateKey: '2026-05-01', elapsedMs: 1000 },
          { dateKey: '2026-05-02', elapsedMs: 1000 },
          { dateKey: '2026-05-03', elapsedMs: 1000 },
        ],
      });
      expect(summary.monthCompletedCount).toBe(3);
      expect(summary.growthDelta).toBe(1);
    });

    it('is 0 when this month < last month (never negative)', () => {
      const summary = computeMonthSummary({
        ...base,
        entries: [
          { dateKey: '2026-04-01', elapsedMs: 1000 },
          { dateKey: '2026-04-02', elapsedMs: 1000 },
          { dateKey: '2026-04-03', elapsedMs: 1000 },
          { dateKey: '2026-05-01', elapsedMs: 1000 },
        ],
      });
      expect(summary.growthDelta).toBe(0);
    });

    it('is 0 when this month equals last month', () => {
      const summary = computeMonthSummary({
        ...base,
        entries: [
          { dateKey: '2026-04-01', elapsedMs: 1000 },
          { dateKey: '2026-04-02', elapsedMs: 1000 },
          { dateKey: '2026-05-01', elapsedMs: 1000 },
          { dateKey: '2026-05-02', elapsedMs: 1000 },
        ],
      });
      expect(summary.growthDelta).toBe(0);
    });

    it('does not mislead on the first month (lastMonthCount === 0)', () => {
      const summary = computeMonthSummary({
        ...base,
        entries: [
          { dateKey: '2026-05-01', elapsedMs: 1000 },
          { dateKey: '2026-05-02', elapsedMs: 1000 },
          { dateKey: '2026-05-03', elapsedMs: 1000 },
        ],
      });
      expect(summary.monthCompletedCount).toBe(3);
      // No real previous month → must NOT claim "more than last month".
      expect(summary.growthDelta).toBe(0);
    });
  });
});
