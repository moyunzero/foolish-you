import { hasRealCompletionForDateKey } from '../../../lib/completion/completionHistoryQueries';
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
