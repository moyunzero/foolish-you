import {
  needsStreakReconcile,
  reconcileStreakForCompletedDay,
} from '../../../lib/streak/reconcileStreak';
import { EMPTY_STREAK_STATE } from '../../../lib/streak/types';
import { makeBinaryPlayingSnapshot } from '../../helpers/dailyGameFixtures';

describe('reconcileStreak', () => {
  it('detects completed daily without streak check-in', () => {
    const snapshot = makeBinaryPlayingSnapshot({
      status: 'completed',
      finishedAt: Date.now(),
    });

    expect(needsStreakReconcile(snapshot, null)).toBe(true);
    expect(
      needsStreakReconcile(snapshot, {
        ...EMPTY_STREAK_STATE,
        currentStreak: 1,
        lastCheckInDateKey: snapshot.dateKey,
        historicalMax: 1,
      }),
    ).toBe(false);
  });

  it('reconciles streak for completed day', () => {
    const snapshot = makeBinaryPlayingSnapshot({
      status: 'completed',
      finishedAt: Date.now(),
    });

    expect(reconcileStreakForCompletedDay(snapshot, null)).toEqual({
      ...EMPTY_STREAK_STATE,
      currentStreak: 1,
      lastCheckInDateKey: snapshot.dateKey,
      historicalMax: 1,
    });
  });
});
