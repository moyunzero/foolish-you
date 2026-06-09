import {
  bandLerp,
  binaryGivensForDate,
  sudokuGivensForDate,
  weekdayBand,
} from '../../../../lib/puzzles/difficulty/weekdayBand';

describe('weekdayBand', () => {
  it('maps Monday to band 0 and Sunday to band 6', () => {
    expect(weekdayBand('2026-06-01')).toBe(0);
    expect(weekdayBand('2026-06-07')).toBe(6);
  });

  it('maps Wednesday to band 2', () => {
    expect(weekdayBand('2026-06-03')).toBe(2);
  });

  it('returns the same band for repeated calls on the same dateKey', () => {
    expect(weekdayBand('2026-06-04')).toBe(weekdayBand('2026-06-04'));
  });

  it('falls back to band 3 for invalid dateKey', () => {
    expect(weekdayBand('not-a-date')).toBe(3);
    expect(weekdayBand('2026-02-30')).toBe(3);
  });
});

describe('bandLerp', () => {
  it('returns easy value at band 0 and hard value at band 6', () => {
    expect(bandLerp(0, 33, 27)).toBe(33);
    expect(bandLerp(6, 33, 27)).toBe(27);
  });

  it('interpolates mid-band values', () => {
    expect(bandLerp(3, 33, 27)).toBe(30);
  });
});

describe('per-game givens helpers', () => {
  it('sudoku givens decrease Mon → Sun', () => {
    expect(sudokuGivensForDate('2026-06-01')).toBeGreaterThan(
      sudokuGivensForDate('2026-06-07'),
    );
    expect(sudokuGivensForDate('2026-06-01')).toBe(33);
    expect(sudokuGivensForDate('2026-06-07')).toBe(27);
  });

  it('binary givens decrease Mon → Sun', () => {
    expect(binaryGivensForDate('2026-06-01')).toBeGreaterThan(
      binaryGivensForDate('2026-06-07'),
    );
    expect(binaryGivensForDate('2026-06-01')).toBe(26);
    expect(binaryGivensForDate('2026-06-07')).toBe(20);
  });
});
