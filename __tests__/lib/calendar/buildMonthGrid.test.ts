import { buildMonthGrid } from '../../../lib/calendar/buildMonthGrid';

describe('buildMonthGrid', () => {
  it('aligns July 2026 days to Sun–Sat columns (1st is Wednesday)', () => {
    const cells = buildMonthGrid({
      monthKey: '2026-07',
      todayKey: '2026-07-22',
      entriesByDate: new Map(),
      freezeDates: new Set(),
    });

    // Jul 1 2026 = Wednesday → index 3 (Sun=0)
    expect(cells[3]?.dateKey).toBe('2026-07-01');
    // Jul 4 2026 = Saturday → index 6
    expect(cells[6]?.dateKey).toBe('2026-07-04');
    // Jul 5 = Sunday → next week index 7
    expect(cells[7]?.dateKey).toBe('2026-07-05');
    // Jul 22 = Wednesday → leading 3 + 21 = index 24
    expect(cells[24]?.dateKey).toBe('2026-07-22');
    expect(cells[24]?.isToday).toBe(true);

    // Every 7th cell in a week row is Saturday — must be in-month for Jul 4, 11, 18, 25
    for (const day of [4, 11, 18, 25]) {
      const idx = cells.findIndex((c) => c.dateKey === `2026-07-${String(day).padStart(2, '0')}`);
      expect(idx % 7).toBe(6);
    }
  });
});
