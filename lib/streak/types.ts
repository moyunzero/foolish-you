export type StreakState = {
  currentStreak: number;
  lastCheckInDateKey: string | null;
  /** 历史最高连签（含当前 streak 曾达到的值） */
  historicalMax: number;
};

export const EMPTY_STREAK_STATE: StreakState = {
  currentStreak: 0,
  lastCheckInDateKey: null,
  historicalMax: 0,
};

export type StreakDisplay = {
  displayStreak: number;
  checkedInToday: boolean;
  streakBroken: boolean;
};
