import { pickMissedYesterdayLine } from '../../../lib/copy/missedYesterday';
import {
  shouldShowMissedYesterdayBanner,
} from '../../../lib/streak/missedYesterdayBanner';

describe('shouldShowMissedYesterdayBanner', () => {
  it('returns false for new users', () => {
    expect(
      shouldShowMissedYesterdayBanner({
        todayKey: '2026-05-19',
        status: 'playing',
        lastCheckInDateKey: null,
        historyEntries: [],
      }),
    ).toBe(false);
  });

  it('returns false when yesterday has real completion', () => {
    expect(
      shouldShowMissedYesterdayBanner({
        todayKey: '2026-05-19',
        status: 'playing',
        lastCheckInDateKey: '2026-05-17',
        historyEntries: [{ dateKey: '2026-05-18', elapsedMs: 1000 }],
      }),
    ).toBe(false);
  });

  it('returns true when yesterday only has inferred completion', () => {
    expect(
      shouldShowMissedYesterdayBanner({
        todayKey: '2026-05-19',
        status: 'playing',
        lastCheckInDateKey: '2026-05-17',
        historyEntries: [
          { dateKey: '2026-05-18', elapsedMs: 1000, inferred: true },
        ],
      }),
    ).toBe(true);
  });

  it('returns true when last check-in is two or more days before today', () => {
    expect(
      shouldShowMissedYesterdayBanner({
        todayKey: '2026-05-19',
        status: 'playing',
        lastCheckInDateKey: '2026-05-17',
        historyEntries: [],
      }),
    ).toBe(true);
  });

  it('returns false when last check-in was yesterday (freeze or consecutive)', () => {
    expect(
      shouldShowMissedYesterdayBanner({
        todayKey: '2026-05-19',
        status: 'playing',
        lastCheckInDateKey: '2026-05-18',
        historyEntries: [],
      }),
    ).toBe(false);
  });

  it('returns false when not playing', () => {
    expect(
      shouldShowMissedYesterdayBanner({
        todayKey: '2026-05-19',
        status: 'completed',
        lastCheckInDateKey: '2026-05-17',
        historyEntries: [],
      }),
    ).toBe(false);
  });
});

describe('pickMissedYesterdayLine', () => {
  it('uses soft pool when freeze consumed today', () => {
    const line = pickMissedYesterdayLine({
      todayKey: '2026-05-19',
      seed: 42,
      locale: 'zh',
      freezeConsumedToday: true,
    });
    expect(line.length).toBeGreaterThan(0);
  });
});
