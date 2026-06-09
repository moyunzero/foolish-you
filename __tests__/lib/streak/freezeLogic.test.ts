import { getIsoWeekKey } from '../../../lib/date/dateKeyMath';
import {
  consumeFreezeForMissedDay,
  grantWeeklyFreeze,
  reconcileStreakOnOpen,
  repairStreakFromYesterdayCompletion,
} from '../../../lib/streak/freezeLogic';
import { EMPTY_STREAK_STATE } from '../../../lib/streak/types';

const baseStreak = {
  currentStreak: 5,
  lastCheckInDateKey: '2026-05-17',
  historicalMax: 8,
  freezeCount: 1,
  lastFreezeGrantWeekKey: '2026-W20',
  freezeConsumedSessionKey: null,
  freezeConsumedDateKeys: [] as string[],
};

describe('getIsoWeekKey', () => {
  it('formats ISO week for mid-year date', () => {
    expect(getIsoWeekKey('2026-05-19')).toBe('2026-W21');
  });

  it('handles year boundary (Monday start)', () => {
    expect(getIsoWeekKey('2025-12-29')).toBe('2026-W01');
  });

  it('handles Thursday in first ISO week', () => {
    expect(getIsoWeekKey('2026-01-01')).toBe('2026-W01');
  });
});

describe('grantWeeklyFreeze', () => {
  it('anchors first ISO week without retroactive grant', () => {
    const next = grantWeeklyFreeze(EMPTY_STREAK_STATE, '2026-05-19');
    expect(next.freezeCount).toBe(0);
    expect(next.lastFreezeGrantWeekKey).toBe('2026-W21');
  });

  it('grants one freeze on new ISO week after anchor', () => {
    const state = {
      ...EMPTY_STREAK_STATE,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W20',
    };
    const next = grantWeeklyFreeze(state, '2026-05-19');
    expect(next.freezeCount).toBe(1);
    expect(next.lastFreezeGrantWeekKey).toBe('2026-W21');
  });

  it('does not grant twice in same week', () => {
    const state = {
      ...EMPTY_STREAK_STATE,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
    };
    const next = grantWeeklyFreeze(state, '2026-05-19');
    expect(next).toEqual(state);
  });

  it('caps freeze count at 2 across consecutive weeks', () => {
    let state = grantWeeklyFreeze(
      { ...EMPTY_STREAK_STATE, lastFreezeGrantWeekKey: '2026-W19' },
      '2026-05-12',
    );
    expect(state.freezeCount).toBe(1);

    state = grantWeeklyFreeze(state, '2026-05-19');
    expect(state.freezeCount).toBe(2);

    state = grantWeeklyFreeze(state, '2026-05-26');
    expect(state.freezeCount).toBe(2);
    expect(state.lastFreezeGrantWeekKey).toBe(getIsoWeekKey('2026-05-26'));
  });
});

describe('consumeFreezeForMissedDay', () => {
  it('consumes freeze when gap is exactly 2 days', () => {
    const { state, consumed } = consumeFreezeForMissedDay(baseStreak, '2026-05-19');
    expect(consumed).toBe(true);
    expect(state.freezeCount).toBe(0);
    expect(state.currentStreak).toBe(5);
    expect(state.lastCheckInDateKey).toBe('2026-05-18');
    expect(state.freezeConsumedSessionKey).toBe('2026-05-19');
    expect(state.freezeConsumedDateKeys).toEqual(['2026-05-18']);
  });

  it('does not consume when yesterday has real completion', () => {
    const { state, consumed } = consumeFreezeForMissedDay(baseStreak, '2026-05-19', [
      { dateKey: '2026-05-18', elapsedMs: 60_000 },
    ]);
    expect(consumed).toBe(false);
    expect(state).toEqual(baseStreak);
  });

  it('does not consume when freezeCount is 0', () => {
    const { consumed } = consumeFreezeForMissedDay(
      { ...baseStreak, freezeCount: 0 },
      '2026-05-19',
    );
    expect(consumed).toBe(false);
  });

  it('does not consume when gap is greater than 2', () => {
    const { consumed } = consumeFreezeForMissedDay(
      { ...baseStreak, lastCheckInDateKey: '2026-05-15' },
      '2026-05-19',
    );
    expect(consumed).toBe(false);
  });
});

describe('reconcileStreakOnOpen', () => {
  it('grants then consumes in order', () => {
    const next = reconcileStreakOnOpen(
      { ...baseStreak, lastFreezeGrantWeekKey: '2026-W21' },
      '2026-05-19',
    );
    expect(next.freezeCount).toBe(0);
    expect(next.lastCheckInDateKey).toBe('2026-05-18');
    expect(next.freezeConsumedSessionKey).toBe('2026-05-19');
  });

  it('ignores inferred completion for today when consuming freeze', () => {
    const next = reconcileStreakOnOpen(
      { ...baseStreak, lastFreezeGrantWeekKey: '2026-W21' },
      '2026-05-19',
      {
        historyEntries: [
          { dateKey: '2026-05-19', elapsedMs: 0, inferred: true },
        ],
      },
    );
    expect(next.lastCheckInDateKey).toBe('2026-05-18');
  });
});

describe('repairStreakFromYesterdayCompletion', () => {
  it('backfills yesterday check-in when real completion exists', () => {
    const repaired = repairStreakFromYesterdayCompletion(baseStreak, '2026-05-19', [
      { dateKey: '2026-05-18', elapsedMs: 90_000 },
    ]);
    expect(repaired).toEqual({
      ...baseStreak,
      currentStreak: 6,
      lastCheckInDateKey: '2026-05-18',
    });
  });

  it('returns null when yesterday has no real completion', () => {
    expect(
      repairStreakFromYesterdayCompletion(baseStreak, '2026-05-19', []),
    ).toBeNull();
  });
});
