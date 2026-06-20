import {
  countCompletedInLastDays,
  daysSincePreviousCompletion,
  hasRealCompletionForDateKey,
} from '../../../lib/completion/completionHistoryQueries';
import type { CompletionEntry } from '../../../lib/storage/completionHistoryStorage';

describe('hasRealCompletionForDateKey', () => {
  const entries: CompletionEntry[] = [
    { dateKey: '2026-05-17', elapsedMs: 1000 },
    { dateKey: '2026-05-18', elapsedMs: 2000, inferred: true },
  ];

  it('returns true for non-inferred entry', () => {
    expect(hasRealCompletionForDateKey(entries, '2026-05-17')).toBe(true);
  });

  it('returns false for inferred-only entry', () => {
    expect(hasRealCompletionForDateKey(entries, '2026-05-18')).toBe(false);
  });

  it('returns false when dateKey missing', () => {
    expect(hasRealCompletionForDateKey(entries, '2026-05-19')).toBe(false);
  });
});

describe('countCompletedInLastDays', () => {
  it('counts only real completions inside the rolling window (incl. today)', () => {
    const entries: CompletionEntry[] = [
      { dateKey: '2026-05-18', elapsedMs: 1 }, // outside 7-day window ending 2026-05-25
      { dateKey: '2026-05-19', elapsedMs: 1 }, // window start (inclusive)
      { dateKey: '2026-05-22', elapsedMs: 1 },
      { dateKey: '2026-05-25', elapsedMs: 1 }, // today (inclusive)
    ];
    expect(countCompletedInLastDays(entries, '2026-05-25', 7)).toBe(3);
  });

  it('excludes inferred and abandoned entries', () => {
    const entries: CompletionEntry[] = [
      { dateKey: '2026-05-23', elapsedMs: 1, inferred: true },
      { dateKey: '2026-05-24', elapsedMs: 1, outcome: 'abandoned' },
      { dateKey: '2026-05-25', elapsedMs: 1, outcome: 'completed' },
    ];
    expect(countCompletedInLastDays(entries, '2026-05-25', 7)).toBe(1);
  });

  it('returns 0 when nothing falls in the window', () => {
    const entries: CompletionEntry[] = [{ dateKey: '2026-04-01', elapsedMs: 1 }];
    expect(countCompletedInLastDays(entries, '2026-05-25', 7)).toBe(0);
  });
});

describe('daysSincePreviousCompletion', () => {
  it('excludes today so the gap reflects the prior completion', () => {
    const entries: CompletionEntry[] = [
      { dateKey: '2026-05-20', elapsedMs: 1 },
      { dateKey: '2026-05-25', elapsedMs: 1 }, // today already recorded
    ];
    expect(daysSincePreviousCompletion(entries, '2026-05-25')).toBe(5);
  });

  it('returns null when there is no prior completion', () => {
    const entries: CompletionEntry[] = [{ dateKey: '2026-05-25', elapsedMs: 1 }];
    expect(daysSincePreviousCompletion(entries, '2026-05-25')).toBeNull();
  });

  it('ignores inferred and abandoned when finding the previous completion', () => {
    const entries: CompletionEntry[] = [
      { dateKey: '2026-05-21', elapsedMs: 1 }, // real completion → gap 4
      { dateKey: '2026-05-23', elapsedMs: 1, inferred: true },
      { dateKey: '2026-05-24', elapsedMs: 1, outcome: 'abandoned' },
    ];
    expect(daysSincePreviousCompletion(entries, '2026-05-25')).toBe(4);
  });

  it('detects a >= 3 day comeback gap', () => {
    const entries: CompletionEntry[] = [{ dateKey: '2026-05-22', elapsedMs: 1 }];
    expect(daysSincePreviousCompletion(entries, '2026-05-25')).toBe(3);
  });
});
