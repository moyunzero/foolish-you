import { addDaysToDateKey, getRollingDateKeysEnding } from '../../../lib/date/dateKeyMath';

describe('dateKeyMath', () => {
  it('addDaysToDateKey crosses month boundary', () => {
    expect(addDaysToDateKey('2026-05-01', -1)).toBe('2026-04-30');
    expect(addDaysToDateKey('2026-04-30', 1)).toBe('2026-05-01');
  });

  it('getRollingDateKeysEnding returns 7 ascending keys including today', () => {
    expect(getRollingDateKeysEnding('2026-05-19', 7)).toEqual([
      '2026-05-13',
      '2026-05-14',
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
      '2026-05-18',
      '2026-05-19',
    ]);
  });
});
