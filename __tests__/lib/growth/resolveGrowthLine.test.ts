import { resolveGrowthTone } from '../../../lib/growth/resolveGrowthLine';
import type { CompletionEntry } from '../../../lib/storage/completionHistoryStorage';

const TODAY = '2026-05-19';

/** Calendar dates relative to TODAY (2026-05-19). */
const D = {
  minus1: '2026-05-18',
  minus2: '2026-05-17',
  minus3: '2026-05-16',
  minus4: '2026-05-15',
  minus5: '2026-05-14',
  minus6: '2026-05-13',
  today: TODAY,
} as const;

function completed(dateKey: string): CompletionEntry {
  return { dateKey, elapsedMs: 1000, outcome: 'completed' };
}

function abandoned(dateKey: string): CompletionEntry {
  return { dateKey, elapsedMs: 1000, outcome: 'abandoned' };
}

describe('resolveGrowthTone', () => {
  describe('completed outcome', () => {
    it('returns comeback when previous completion is >= 3 days ago', () => {
      const entries = [completed(D.minus4), completed(D.today)];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'completed' }),
      ).toBe('comeback');
    });

    it('returns hot when last 7 days have >= 6 completions', () => {
      const entries = [
        completed(D.minus5),
        completed(D.minus4),
        completed(D.minus3),
        completed(D.minus2),
        completed(D.minus1),
        completed(D.today),
      ];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'completed' }),
      ).toBe('hot');
    });

    it('returns steady when last 7 days have 4 completions', () => {
      const entries = [
        completed(D.minus3),
        completed(D.minus2),
        completed(D.minus1),
        completed(D.today),
      ];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'completed' }),
      ).toBe('steady');
    });

    it('returns steady when last 7 days have 5 completions', () => {
      const entries = [
        completed(D.minus4),
        completed(D.minus3),
        completed(D.minus2),
        completed(D.minus1),
        completed(D.today),
      ];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'completed' }),
      ).toBe('steady');
    });

    it('returns null on an ordinary day (gap < 3, last7 < 4)', () => {
      const entries = [completed(D.minus1), completed(D.today)];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'completed' }),
      ).toBeNull();
    });

    it('returns null for a brand-new user (no prior completion, sparse window)', () => {
      const entries = [completed(D.today)];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'completed' }),
      ).toBeNull();
    });
  });

  describe('comeback takes priority over density (ordered early-return)', () => {
    it('returns comeback even when density alone would be steady', () => {
      // gap = 3 (latest prior completion at minus3) AND last7 = 5 → comeback wins.
      const entries = [
        completed(D.minus6),
        completed(D.minus5),
        completed(D.minus4),
        completed(D.minus3),
        completed(D.today),
      ];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'completed' }),
      ).toBe('comeback');
    });
  });

  describe('abandoned outcome (D-10: silent except comeback)', () => {
    it('returns comeback when previous completion is >= 3 days ago', () => {
      const entries = [completed(D.minus4), abandoned(D.today)];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'abandoned' }),
      ).toBe('comeback');
    });

    it('returns null even when last 7 days are hot', () => {
      const entries = [
        completed(D.minus6),
        completed(D.minus5),
        completed(D.minus4),
        completed(D.minus3),
        completed(D.minus2),
        completed(D.minus1),
        abandoned(D.today),
      ];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'abandoned' }),
      ).toBeNull();
    });

    it('returns null on an ordinary abandoned day', () => {
      const entries = [completed(D.minus1), abandoned(D.today)];
      expect(
        resolveGrowthTone({ entries, today: TODAY, outcome: 'abandoned' }),
      ).toBeNull();
    });
  });
});
