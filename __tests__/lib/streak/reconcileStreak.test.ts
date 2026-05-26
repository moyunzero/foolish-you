import {
  needsStreakReconcile,
  reconcileStreakForCompletedDay,
} from '../../../lib/streak/reconcileStreak';
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
      currentStreak: 1,
      lastCheckInDateKey: snapshot.dateKey,
      historicalMax: 1,
    });
  });
});
