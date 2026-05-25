import type { DailySnapshot } from '../puzzles/types';
import { applyCheckIn, getStreakDisplay } from './streakLogic';
import type { StreakState } from './types';

/** Completed daily snapshot but streak not yet recorded for that dateKey. */
export function needsStreakReconcile(
  snapshot: DailySnapshot | null,
  streak: StreakState | null,
): snapshot is DailySnapshot {
  if (snapshot?.status !== 'completed') return false;
  const display = getStreakDisplay(streak, snapshot.dateKey);
  return !display.checkedInToday;
}

export function reconcileStreakForCompletedDay(
  snapshot: DailySnapshot,
  streak: StreakState | null,
): StreakState {
  return applyCheckIn(streak, snapshot.dateKey);
}
