import {
  isSundaySpecialDate,
  resolveGameStreakSubline,
} from '../../../lib/copy/sundaySpecial';

const SUNDAY = '2026-07-12';
const MONDAY = '2026-07-13';
const SUNDAY_LINE = '今天是周日特辑。';
const FREEZE_LINE = '护盾兜了昨日空档。';
const MISSED_LINE = '昨天漏了？今天还能救。';

describe('isSundaySpecialDate', () => {
  it('is true for local Sunday dateKey', () => {
    expect(isSundaySpecialDate(SUNDAY)).toBe(true);
  });

  it('is false for Monday dateKey', () => {
    expect(isSundaySpecialDate(MONDAY)).toBe(false);
  });
});

describe('resolveGameStreakSubline', () => {
  const sundayBase = {
    showPlayChrome: true,
    freezeConsumedToday: false,
    freezeConsumedLine: FREEZE_LINE,
    missedYesterdayLine: null as string | null,
    dateKey: SUNDAY,
    sundayGameSubline: SUNDAY_LINE,
  };

  it('returns null when play chrome is hidden', () => {
    expect(
      resolveGameStreakSubline({ ...sundayBase, showPlayChrome: false }),
    ).toBeNull();
  });

  it('prefers freeze consumed line over Sunday', () => {
    expect(
      resolveGameStreakSubline({
        ...sundayBase,
        freezeConsumedToday: true,
      }),
    ).toBe(FREEZE_LINE);
  });

  it('returns null when freeze is consumed but line is empty', () => {
    expect(
      resolveGameStreakSubline({
        ...sundayBase,
        freezeConsumedToday: true,
        freezeConsumedLine: '',
      }),
    ).toBeNull();
  });

  it('prefers missed-yesterday line over Sunday', () => {
    expect(
      resolveGameStreakSubline({
        ...sundayBase,
        missedYesterdayLine: MISSED_LINE,
      }),
    ).toBe(MISSED_LINE);
  });

  it('returns Sunday identity when band is Sunday and no freeze/miss', () => {
    expect(resolveGameStreakSubline(sundayBase)).toBe(SUNDAY_LINE);
  });

  it('returns null on weekday even with chrome shown', () => {
    expect(
      resolveGameStreakSubline({
        ...sundayBase,
        dateKey: MONDAY,
      }),
    ).toBeNull();
  });

  it('returns null when dateKey is missing', () => {
    expect(
      resolveGameStreakSubline({
        ...sundayBase,
        dateKey: null,
      }),
    ).toBeNull();
  });
});
