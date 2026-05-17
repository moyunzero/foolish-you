import { getLocalDateKey } from '../../../lib/date/localDay';

describe('getLocalDateKey', () => {
  it('returns local calendar date parts', () => {
    const date = new Date(2026, 4, 17, 1, 30, 0);
    expect(getLocalDateKey(date)).toBe('2026-05-17');
  });

  it('does not use UTC day when local is still previous calendar day', () => {
    const utcPlus8 = new Date('2026-05-16T17:30:00.000Z');
    const localKey = getLocalDateKey(
      new Date(
        utcPlus8.getUTCFullYear(),
        utcPlus8.getUTCMonth(),
        utcPlus8.getUTCDate(),
        utcPlus8.getUTCHours() + 8,
        utcPlus8.getUTCMinutes(),
      ),
    );
    expect(localKey).toBe('2026-05-17');
    expect(utcPlus8.toISOString().slice(0, 10)).toBe('2026-05-16');
  });
});
