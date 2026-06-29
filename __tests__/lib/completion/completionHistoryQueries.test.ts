import {
  countCompletedInLastDays,
  collectSameTypeBandElapsedSamples,
  daysSincePreviousCompletion,
  hasRealCompletionForDateKey,
  isSmootherEligible,
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

describe('collectSameTypeBandElapsedSamples', () => {
  const today = '2026-05-19'; // Tuesday band

  it('collects same gameType and weekday band before today', () => {
    const entries: CompletionEntry[] = [
      { dateKey: '2026-05-12', elapsedMs: 120_000, outcome: 'completed', gameType: 'sudoku' },
      { dateKey: '2026-05-05', elapsedMs: 130_000, outcome: 'completed', gameType: 'sudoku' },
      { dateKey: '2026-04-28', elapsedMs: 140_000, outcome: 'completed', gameType: 'sudoku' },
      { dateKey: '2026-05-18', elapsedMs: 90_000, outcome: 'completed', gameType: 'binary' },
    ];
    expect(collectSameTypeBandElapsedSamples(entries, today, 'sudoku')).toEqual([
      120_000, 130_000, 140_000,
    ]);
  });

  it('skips undefined gameType, abandoned, inferred, and wrong band', () => {
    const entries: CompletionEntry[] = [
      { dateKey: '2026-05-12', elapsedMs: 100_000, outcome: 'completed' },
      { dateKey: '2026-05-13', elapsedMs: 100_000, outcome: 'completed', gameType: 'sudoku' },
      { dateKey: '2026-05-11', elapsedMs: 100_000, outcome: 'abandoned', gameType: 'sudoku' },
      { dateKey: '2026-05-10', elapsedMs: 100_000, inferred: true, gameType: 'sudoku' },
    ];
    expect(collectSameTypeBandElapsedSamples(entries, today, 'sudoku')).toEqual([]);
  });
});

describe('isSmootherEligible', () => {
  const today = '2026-05-19';

  function sudokuHistory(elapsedMs: number): CompletionEntry[] {
    return [
      { dateKey: '2026-05-12', elapsedMs, outcome: 'completed', gameType: 'sudoku' },
      { dateKey: '2026-05-05', elapsedMs, outcome: 'completed', gameType: 'sudoku' },
      { dateKey: '2026-04-28', elapsedMs, outcome: 'completed', gameType: 'sudoku' },
    ];
  }

  it('returns false with fewer than 3 samples', () => {
    const entries = sudokuHistory(120_000).slice(0, 2);
    expect(isSmootherEligible(entries, today, 'sudoku', 60_000)).toBe(false);
  });

  it('returns true when today is clearly faster than median', () => {
    const entries = sudokuHistory(120_000);
    expect(isSmootherEligible(entries, today, 'sudoku', 80_000)).toBe(true);
  });

  it('returns false when today is not faster enough', () => {
    const entries = sudokuHistory(120_000);
    expect(isSmootherEligible(entries, today, 'sudoku', 100_000)).toBe(false);
  });
});
