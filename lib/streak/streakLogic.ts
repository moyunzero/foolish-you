import type { StreakDisplay, StreakState } from './types';
import { EMPTY_STREAK_STATE } from './types';
import { bumpHistoricalMax } from '../storage/streakStorage';

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Calendar days from `fromKey` to `toKey` (toKey is same or later). */
export function daysBetweenDateKeys(fromKey: string, toKey: string): number {
  const from = parseDateKey(fromKey).getTime();
  const to = parseDateKey(toKey).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function applyCheckIn(
  state: StreakState | null,
  todayKey: string,
): StreakState {
  const base: StreakState = state ?? EMPTY_STREAK_STATE;

  if (base.lastCheckInDateKey === todayKey) {
    return base;
  }

  let nextStreak = 1;
  if (base.lastCheckInDateKey != null) {
    const gap = daysBetweenDateKeys(base.lastCheckInDateKey, todayKey);
    if (gap === 1) {
      nextStreak = base.currentStreak + 1;
    }
  }

  return bumpHistoricalMax({
    currentStreak: nextStreak,
    lastCheckInDateKey: todayKey,
    historicalMax: base.historicalMax,
  });
}

export function getStreakDisplay(
  state: StreakState | null,
  todayKey: string,
): StreakDisplay {
  const base: StreakState = state ?? EMPTY_STREAK_STATE;

  if (base.lastCheckInDateKey == null) {
    return {
      displayStreak: 0,
      checkedInToday: false,
      streakBroken: false,
    };
  }

  const gap = daysBetweenDateKeys(base.lastCheckInDateKey, todayKey);

  if (gap === 0) {
    return {
      displayStreak: base.currentStreak,
      checkedInToday: true,
      streakBroken: false,
    };
  }

  if (gap === 1) {
    return {
      displayStreak: base.currentStreak,
      checkedInToday: false,
      streakBroken: false,
    };
  }

  return {
    displayStreak: 0,
    checkedInToday: false,
    streakBroken: true,
  };
}
