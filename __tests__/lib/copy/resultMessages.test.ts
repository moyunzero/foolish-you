jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { pickResultCopy } from '../../../lib/copy/resultMessages';

describe('pickResultCopy', () => {
  const dateKey = '2026-05-20';
  const seed = 42_424_242;

  it('returns stable copy for same dateKey, seed, and status', () => {
    const a = pickResultCopy('completed', 125_000, dateKey, seed);
    const b = pickResultCopy('completed', 125_000, dateKey, seed);
    expect(a).toEqual(b);
  });

  it('differs between completed and abandoned for same day', () => {
    const completed = pickResultCopy('completed', 60_000, dateKey, seed);
    const abandoned = pickResultCopy('abandoned', 60_000, dateKey, seed);
    expect(completed.mode).toBe('completed');
    expect(abandoned.mode).toBe('abandoned');
    expect(completed.punchline).not.toBe(abandoned.punchline);
  });

  it('derives seed from dateKey when seed omitted', () => {
    const a = pickResultCopy('abandoned', 30_000, dateKey);
    const b = pickResultCopy('abandoned', 30_000, dateKey);
    expect(a).toEqual(b);
    expect(a.mode).toBe('abandoned');
    if (a.mode === 'abandoned') {
      expect(a.foolIndexPercent).toBeGreaterThanOrEqual(72);
      expect(a.foolIndexPercent).toBeLessThan(96);
    }
  });
});
