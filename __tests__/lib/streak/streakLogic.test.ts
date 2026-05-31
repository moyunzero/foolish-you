import {
  applyCheckIn,
  daysBetweenDateKeys,
  getStreakDisplay,
} from '../../../lib/streak/streakLogic';

describe('daysBetweenDateKeys', () => {
  it('returns 0 for same day', () => {
    expect(daysBetweenDateKeys('2026-05-25', '2026-05-25')).toBe(0);
  });

  it('returns 1 for consecutive calendar days', () => {
    expect(daysBetweenDateKeys('2026-05-24', '2026-05-25')).toBe(1);
  });
});

describe('applyCheckIn', () => {
  it('starts streak at 1 on first check-in', () => {
    expect(applyCheckIn(null, '2026-05-25')).toEqual({
      currentStreak: 1,
      lastCheckInDateKey: '2026-05-25',
      historicalMax: 1,
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
    });
  });

  it('increments when yesterday was last check-in', () => {
    const prev = {
      currentStreak: 3,
      lastCheckInDateKey: '2026-05-24',
      historicalMax: 8,
      freezeCount: 2,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: '2026-05-24',
    };
    expect(applyCheckIn(prev, '2026-05-25')).toEqual({
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-25',
      historicalMax: 8,
      freezeCount: 2,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: '2026-05-24',
    });
  });

  it('resets to 1 after a gap', () => {
    const prev = {
      currentStreak: 10,
      lastCheckInDateKey: '2026-05-20',
      historicalMax: 10,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    };
    expect(applyCheckIn(prev, '2026-05-25')).toEqual({
      currentStreak: 1,
      lastCheckInDateKey: '2026-05-25',
      historicalMax: 10,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });
  });

  it('does not change when already checked in today', () => {
    const prev = {
      currentStreak: 5,
      lastCheckInDateKey: '2026-05-25',
      historicalMax: 5,
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
    };
    expect(applyCheckIn(prev, '2026-05-25')).toBe(prev);
  });
});

describe('getStreakDisplay', () => {
  it('shows zero streak when never checked in', () => {
    expect(getStreakDisplay(null, '2026-05-25')).toEqual({
      displayStreak: 0,
      checkedInToday: false,
      streakBroken: false,
    });
  });

  it('marks checked in today', () => {
    const state = {
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-25',
      historicalMax: 4,
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
    };
    expect(getStreakDisplay(state, '2026-05-25')).toEqual({
      displayStreak: 4,
      checkedInToday: true,
      streakBroken: false,
    });
  });

  it('keeps streak alive when last check-in was yesterday', () => {
    const state = {
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-24',
      historicalMax: 4,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    };
    expect(getStreakDisplay(state, '2026-05-25')).toEqual({
      displayStreak: 4,
      checkedInToday: false,
      streakBroken: false,
    });
  });

  it('shows broken streak after multi-day gap', () => {
    const state = {
      currentStreak: 9,
      lastCheckInDateKey: '2026-05-20',
      historicalMax: 9,
      freezeCount: 0,
      lastFreezeGrantWeekKey: null,
      freezeConsumedSessionKey: null,
    };
    expect(getStreakDisplay(state, '2026-05-25')).toEqual({
      displayStreak: 0,
      checkedInToday: false,
      streakBroken: true,
    });
  });
});
